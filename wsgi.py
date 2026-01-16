"""
Fichier WSGI pour le déploiement de l'application Flask
Ce fichier est utilisé par les serveurs WSGI (Gunicorn, uWSGI, mod_wsgi, etc.)
"""
from app import app, db
from models import Utilisateur

# Initialiser la base de données au démarrage
with app.app_context():
    db.create_all()
    # Créer l'admin par défaut s'il n'existe pas
    if not Utilisateur.query.filter_by(role='Admin').first():
        admin = Utilisateur(
            nom='Admin',
            prenom='System',
            email='admin@uniresto.mr',
            role='Admin',
            matricule='ADM001',
            is_active=True
        )
        admin.set_password('adminpassword')
        db.session.add(admin)
        db.session.commit()

# L'application Flask est importée depuis app.py
# Le serveur WSGI utilisera cette variable 'application'
application = app

if __name__ == "__main__":
    # Pour le développement local, on peut lancer directement
    application.run(debug=False)
