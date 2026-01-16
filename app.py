
import os
import random
import string
from flask import Flask, render_template, request, redirect, url_for, flash, session
from models import db, Utilisateur, Menu, Reservation, Ticket
from datetime import datetime
from sqlalchemy import func
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'uniresto_premium_secret_key')

# Configuration BDD PostgreSQL
# Utiliser DATABASE_URL si disponible, sinon construire à partir des variables individuelles
from urllib.parse import quote_plus

database_url = os.environ.get('DATABASE_URL')
if not database_url:
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '5432')
    db_name = os.environ.get('DB_NAME', 'uniresto_db')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'postgres')
    # Encoder le mot de passe pour gérer les caractères spéciaux
    encoded_password = quote_plus(db_password)
    database_url = f'postgresql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Filtre de date personnalisé
@app.template_filter('format_date')
def _jinja2_filter_datetime(date, fmt=None):
    if not date: return ""
    if isinstance(date, str):
        try:
            date = datetime.strptime(date, '%Y-%m-%d')
        except:
            return date
    try:
        return date.strftime(fmt or '%d/%m/%Y')
    except:
        return str(date)

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = Utilisateur.query.filter_by(email=email).first()
        if user and user.check_password(password):
            session['user_id'] = user.id_utilisateur
            session['user_role'] = user.role
            session['user_name'] = f"{user.prenom} {user.nom}"
            return redirect(url_for('dashboard'))
        flash('Identifiants invalides.', 'danger')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        matricule = request.form.get('matricule')
        if Utilisateur.query.filter((Utilisateur.email == email) | (Utilisateur.matricule == matricule)).first():
            flash('Compte déjà existant.', 'danger')
        else:
            new_student = Utilisateur(
                matricule=matricule, nom=request.form.get('nom'),
                prenom=request.form.get('prenom'), email=email,
                role='Student', is_active=True
            )
            new_student.set_password(request.form.get('password'))
            db.session.add(new_student)
            db.session.commit()
            flash('Compte créé avec succès !', 'success')
            return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session: return redirect(url_for('login'))
    role = session.get('user_role')
    
    if role == 'Student':
        menus = Menu.query.filter(Menu.is_active == True, Menu.stock > 0).order_by(Menu.date_menu.asc()).all()
        res_data = db.session.query(Menu.date_menu, Menu.type_repas)\
            .join(Reservation, Reservation.id_menu == Menu.id_menu)\
            .filter(Reservation.id_utilisateur == session['user_id'])\
            .all()
        booked_slots = [f"{d.strftime('%Y-%m-%d')}_{t}" for d, t in res_data]
        return render_template('student/dashboard.html', menus=menus, booked_slots=booked_slots)
    
    elif role == 'Staff':
        ticket_code = request.args.get('ticket_code')
        found_ticket = student = menu = None
        if ticket_code:
            found_ticket = Ticket.query.filter_by(code=ticket_code.upper()).first()
            if found_ticket:
                reservation = Reservation.query.get(found_ticket.id_reservation)
                student = Utilisateur.query.get(reservation.id_utilisateur)
                menu = Menu.query.get(reservation.id_menu)
        bookings = Reservation.query.order_by(Reservation.created_at.desc()).limit(10).all()
        menus = Menu.query.order_by(Menu.date_menu.desc()).all()
        return render_template('staff/dashboard.html', bookings=bookings, menus=menus, found_ticket=found_ticket, student=student, menu=menu)
    
    elif role == 'Admin':
        staff_users = Utilisateur.query.filter_by(role='Staff').all()
        total_bookings = Reservation.query.count()
        results = db.session.query(Menu.date_menu, func.sum(Menu.prix).label('daily_total'))\
            .join(Reservation).filter(Reservation.is_paid == True)\
            .group_by(Menu.date_menu).order_by(Menu.date_menu.desc()).all()
        
        daily_revenues = [{'date_menu': r.date_menu, 'total': r.daily_total or 0} for r in results]
        total_revenue = sum(r['total'] for r in daily_revenues)
        
        return render_template('admin/dashboard.html', 
                             users=staff_users, 
                             total_bookings=total_bookings, 
                             daily_revenues=daily_revenues, 
                             total_revenue=total_revenue)

@app.route('/admin/add_staff', methods=['GET', 'POST'])
def add_staff_page():
    if session.get('user_role') != 'Admin': return redirect(url_for('login'))
    if request.method == 'POST':
        email = request.form.get('email')
        if not Utilisateur.query.filter_by(email=email).first():
            staff = Utilisateur(
                matricule=request.form.get('matricule'), nom=request.form.get('nom'),
                prenom=request.form.get('prenom'), email=email, role='Staff', is_active=True
            )
            staff.set_password(request.form.get('password'))
            db.session.add(staff)
            db.session.commit()
            flash('Nouveau collaborateur ajouté.', 'success')
            return redirect(url_for('dashboard'))
        flash('Email déjà existant.', 'danger')
    return render_template('admin/add_staff.html')

@app.route('/tickets')
def my_tickets():
    if 'user_id' not in session or session.get('user_role') != 'Student': return redirect(url_for('login'))
    user_bookings = Reservation.query.filter_by(id_utilisateur=session['user_id']).order_by(Reservation.created_at.desc()).all()
    return render_template('student/tickets.html', bookings=user_bookings)

@app.route('/book/<int:menu_id>', methods=['POST'])
def book_meal(menu_id):
    if session.get('user_role') != 'Student': return "Unauthorized", 403
    method = request.form.get('method')
    target_menu = Menu.query.get_or_404(menu_id)
    
    if target_menu.stock <= 0:
        flash('Plus de stock pour ce repas.', 'danger')
        return redirect(url_for('dashboard'))

    conflict = Reservation.query.join(Menu).filter(
        Reservation.id_utilisateur == session['user_id'],
        Menu.date_menu == target_menu.date_menu,
        Menu.type_repas == target_menu.type_repas
    ).first()

    if conflict:
        flash('Vous avez déjà réservé pour ce créneau.', 'warning')
    else:
        target_menu.stock -= 1
        new_res = Reservation(
            id_utilisateur=session['user_id'], id_menu=menu_id,
            original_date_menu=target_menu.date_menu, payment_method=method,
            is_paid=(method == 'online'), status='confirmed'
        )
        db.session.add(new_res)
        db.session.commit()
        
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        ticket = Ticket(id_reservation=new_res.id_reservation, code=code, qr_code=code)
        db.session.add(ticket)
        db.session.commit()
        flash('Repas réservé avec succès !', 'success')
        
    return redirect(url_for('my_tickets'))

@app.route('/staff/add_menu', methods=['POST'])
def add_menu():
    if session.get('user_role') != 'Staff': return "Unauthorized", 403
    date_str = request.form.get('date_menu')
    new_menu = Menu(
        date_menu=datetime.strptime(date_str, '%Y-%m-%d').date(),
        type_repas=request.form.get('type_repas'), 
        description=request.form.get('description'),
        prix=float(request.form.get('prix')), 
        image_url=request.form.get('image_url'),
        stock=int(request.form.get('stock', 100)),
        is_active=True
    )
    db.session.add(new_menu)
    db.session.commit()
    flash('Menu publié avec succès.', 'success')
    return redirect(url_for('dashboard'))

@app.route('/staff/edit_menu/<int:menu_id>', methods=['GET', 'POST'])
def edit_menu(menu_id):
    if session.get('user_role') != 'Staff': return "Unauthorized", 403
    menu = Menu.query.get_or_404(menu_id)
    if request.method == 'POST':
        date_str = request.form.get('date_menu')
        menu.date_menu = datetime.strptime(date_str, '%Y-%m-%d').date()
        menu.type_repas = request.form.get('type_repas')
        menu.description = request.form.get('description')
        menu.prix = float(request.form.get('prix'))
        menu.image_url = request.form.get('image_url')
        menu.stock = int(request.form.get('stock'))
        db.session.commit()
        flash('Menu mis à jour.', 'success')
        return redirect(url_for('dashboard'))
    return render_template('staff/edit_menu.html', menu=menu)

@app.route('/staff/toggle_menu/<int:menu_id>')
def toggle_menu(menu_id):
    if session.get('user_role') != 'Staff': return "Unauthorized", 403
    menu = Menu.query.get_or_404(menu_id)
    menu.is_active = not menu.is_active
    db.session.commit()
    return redirect(url_for('dashboard'))

@app.route('/staff/delete_menu/<int:menu_id>')
def delete_menu(menu_id):
    if session.get('user_role') != 'Staff': return "Unauthorized", 403
    menu = Menu.query.get_or_404(menu_id)
    db.session.delete(menu)
    db.session.commit()
    flash('Menu supprimé.', 'info')
    return redirect(url_for('dashboard'))

@app.route('/staff/search_ticket', methods=['POST'])
def search_ticket():
    if session.get('user_role') != 'Staff': return "Unauthorized", 403
    code = request.form.get('ticket_code')
    return redirect(url_for('dashboard', ticket_code=code))

@app.route('/staff/consume_ticket/<int:ticket_id>', methods=['POST'])
def consume_ticket(ticket_id):
    if session.get('user_role') != 'Staff': return "Unauthorized", 403
    ticket = Ticket.query.get_or_404(ticket_id)
    if not ticket.is_used:
        res = Reservation.query.get(ticket.id_reservation)
        res.is_paid = True
        ticket.is_used = True
        ticket.used_at = datetime.utcnow()
        db.session.commit()
        flash('Ticket validé.', 'success')
    else:
        flash('Ce ticket a déjà été utilisé.', 'danger')
    return redirect(url_for('dashboard'))

@app.route('/staff/scanner')
def staff_scanner():
    if session.get('user_role') != 'Staff': return redirect(url_for('login'))
    return render_template('staff/scanner.html')

@app.route('/admin/delete_staff/<int:user_id>')
def delete_user(user_id):
    if session.get('user_role') != 'Admin': return "Unauthorized", 403
    user = Utilisateur.query.get_or_404(user_id)
    if user.role == 'Staff':
        db.session.delete(user)
        db.session.commit()
        flash('Compte supprimé.', 'info')
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Utilisateur.query.filter_by(role='Admin').first():
            admin = Utilisateur(nom='Admin', prenom='System', email='admin@uniresto.mr', role='Admin', matricule='ADM001')
            admin.set_password('adminpassword')
            db.session.add(admin)
            db.session.commit()
    app.run(debug=True)
