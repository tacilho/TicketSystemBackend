import os
from app import app, db, User, Sector, Client
from werkzeug.security import generate_password_hash

def init():
    with app.app_context():
        print("Iniciando verificação do banco de dados...")
        db.create_all()
        try:
            # Usuários Padrão
            if not User.query.filter_by(email='suporte@gmail.com').first():
                support = User(name='Suporte', email='suporte@gmail.com', password=generate_password_hash('123'), role='operator', is_admin=False)
                db.session.add(support)
                print("Usuário Suporte criado.")
            
            if not User.query.filter_by(email='adm@123').first():
                admin = User(name='Administrador', email='adm@123', password=generate_password_hash('admin'), role='admin', is_admin=True)
                db.session.add(admin)
                print("Usuário Administrador criado.")
                
            if not User.query.filter_by(email='teste@gmail.com').first():
                client_user = User(name='Pedro', email='teste@gmail.com', password=generate_password_hash('teste'), role='user', is_admin=False)
                db.session.add(client_user)
                print("Usuário Pedro (teste) criado.")
                
            db.session.commit()
            
            # Setor Padrão
            if not Sector.query.filter_by(name='Expedição').first():
                expedicao = Sector(name='Expedição', manager='Gabriel Otacilio')
                db.session.add(expedicao)
                print("Setor Expedição criado.")

            # Cliente Padrão
            if not Client.query.filter_by(name='Gabriel Otacilio').first():
                gabriel = Client(name='Gabriel Otacilio', email='gabriel.trans@gmail.com', sector='Expedição', username='Gabriel Otacilio')
                db.session.add(gabriel)
                print("Cliente Gabriel Otacilio criado.")

            db.session.commit()
            print("Verificação do banco de dados concluída com sucesso.")
        except Exception as e:
            db.session.rollback()
            print(f"Aviso durante a inicialização do banco: {e}")

if __name__ == '__main__':
    init()
