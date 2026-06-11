from app import app, db, Ticket, User
import datetime
import random
import json

with app.app_context():
    # 1. MOCK DATA
    print(">> Inserindo 15 tickets mockados...")
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
        if status == 'aberto': op_id = None
            
        t = Ticket(
            client_id=None,
            client_name=f'Cliente Mockado {i%3 + 1}',
            title=f'Ticket Teste Filtro {i}',
            description='Este é um ticket mockado para validar os filtros.',
            status=status,
            operator_id=op_id
        )
        t.created_at = dt
        db.session.add(t)
    db.session.commit()
    print(">> Mock Data inserido!")

    # 2. TEST FILTERS
    print("\n>> Executando testes via Test Client...")
    admin = User.query.filter_by(role='admin').first()
    
with app.test_client() as client:
    with client.session_transaction() as sess:
        sess['user_id'] = admin.id

    print("\n=== TESTE 1: Sem filtros (Visão Geral) ===")
    res = client.get('/api/reports')
    data = json.loads(res.data)
    print(f"Total de Tickets: {data.get('total')}")
    print(f"Aguardando: {data.get('aberto')}, Em Andamento: {data.get('em_andamento')}, Concluídos: {data.get('fechado')}")
    
    print("\n=== TESTE 2: Filtro de Data (Últimos 30 dias) ===")
    start_dt = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
    res2 = client.get(f'/api/reports?data_inicio={start_dt}')
    data2 = json.loads(res2.data)
    print(f"Data Inicial usada: {start_dt}")
    print(f"Total Retornado: {data2.get('total')}")
    
    print("\n=== TESTE 3: Filtro por Operador ===")
    res3 = client.get(f'/api/reports?operador_id={operator.id}')
    data3 = json.loads(res3.data)
    print(f"Filtrando pelo Operador '{operator.name}' (ID: {operator.id})")
    print(f"Total Retornado: {data3.get('total')}")
    print("Contagem agregada retornada pela API:")
    for op_data in data3.get('tickets_por_operador', []):
        print(f" - {op_data['operador']}: {op_data['count']}")
