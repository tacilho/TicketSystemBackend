from app import app, db, User, Ticket
import json
import datetime
import random

with app.app_context():
    # MOCK DATA
    operator = User.query.filter_by(role='operator').first()
    operator2 = User.query.filter_by(role='admin').first()
    op_ids = [operator.id, operator2.id] if operator and operator2 else []
    
    base_date = datetime.datetime.now()
    
    for i in range(15):
        days_ago = random.randint(1, 90)
        t = Ticket(
            client_id=None,
            client_name=f'Cliente Mockado {i%3 + 1}',
            title=f'Ticket Teste Filtro {i}',
            description='Este é um ticket mockado para validar os filtros.',
            status=random.choice(['em andamento', 'fechado']),
            operator_id=random.choice(op_ids) if op_ids else None
        )
        t.created_at = base_date - datetime.timedelta(days=days_ago)
        db.session.add(t)
    db.session.commit()
    
    admin_id = operator2.id if operator2 else 1
    op_id = operator.id if operator else 1

with app.test_client() as client:
    with client.session_transaction() as sess:
        sess['user_id'] = admin_id

    print("--- 1. SEM FILTROS ---")
    res = client.get('/api/reports')
    data = json.loads(res.data)
    print(f"Total de Tickets no BD: {data.get('total')}")

    print("\n--- 2. FILTRO DE DATA (Últimos 45 dias) ---")
    start_dt = (datetime.datetime.now() - datetime.timedelta(days=45)).strftime('%Y-%m-%d')
    res = client.get(f'/api/reports?data_inicio={start_dt}')
    data_date = json.loads(res.data)
    print(f"Total retornados: {data_date.get('total')}")

    print("\n--- 3. FILTRO DE OPERADOR ---")
    res = client.get(f'/api/reports?operador_id={op_id}')
    data_op = json.loads(res.data)
    print(f"Total retornados pelo operador ID {op_id}: {data_op.get('total')}")

    print("\n--- 4. FILTROS COMBINADOS (Data + Operador) ---")
    res = client.get(f'/api/reports?data_inicio={start_dt}&operador_id={op_id}')
    data_comb = json.loads(res.data)
    print(f"Total (Data + Operador): {data_comb.get('total')}")
    print("Contagem por Status:")
    for s in data_comb.get('tickets_por_status', []):
        print(f"  - {s['status']}: {s['count']}")
