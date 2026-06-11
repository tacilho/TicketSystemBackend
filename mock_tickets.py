from app import app, db, Ticket, User, Client
import datetime
import random

with app.app_context():
    operator = User.query.filter_by(role='operator').first()
    operator2 = User.query.filter_by(role='admin').first()
    
    op_ids = [operator.id, operator2.id] if operator and operator2 else []
    
    statuses = ['aberto', 'em andamento', 'fechado']
    
    base_date = datetime.datetime.now()
    
    for i in range(15):
        days_ago = random.randint(1, 90)
        dt = base_date - datetime.timedelta(days=days_ago)
        
        op_id = random.choice(op_ids) if op_ids else None
        status = random.choice(statuses)
        if status == 'aberto':
            op_id = None # abertos geralmente não tem operador
            
        t = Ticket(
            client_id=None,
            client_name=f'Cliente Mockado {i%3 + 1}',
            title=f'Ticket Teste Filtro {i}',
            description='Este é um ticket mockado para validar os filtros de data e operador.',
            status=status,
            operator_id=op_id
        )
        t.created_at = dt
        db.session.add(t)
        
    db.session.commit()
    print("15 tickets mockados inseridos com sucesso!")
