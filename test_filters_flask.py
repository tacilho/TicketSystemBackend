from app import app, db, User
import json
import datetime

with app.test_client() as client:
    with app.app_context():
        admin = User.query.filter_by(role='admin').first()
        admin_id = admin.id if admin else 1

    # Injetando sessão
    with client.session_transaction() as sess:
        sess['user_id'] = admin_id

    print("=== TESTE 1: Sem filtros (Visão Geral) ===")
    res = client.get('/api/reports')
    data = json.loads(res.data)
    print(f"Total de Tickets: {data.get('total')}")
    print(f"Aguardando: {data.get('aberto')}, Em Andamento: {data.get('em_andamento')}, Concluídos: {data.get('fechado')}")
    
    print("\n=== TESTE 2: Filtro de Data (Últimos 30 dias) ===")
    start_dt = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
    res2 = client.get(f'/api/reports?data_inicio={start_dt}')
    data2 = json.loads(res2.data)
    print(f"Data Inicial usada: {start_dt}")
    print(f"Total Retornado: {data2.get('total')} (Deve ser menor ou igual ao Teste 1)")
    
    print("\n=== TESTE 3: Filtro por Operador ===")
    with app.app_context():
        op = User.query.filter_by(role='operator').first()
        op_id = op.id if op else admin_id
        
    res3 = client.get(f'/api/reports?operador_id={op_id}')
    data3 = json.loads(res3.data)
    print(f"Filtrando pelo Operador ID: {op_id}")
    print(f"Total Retornado: {data3.get('total')} (Deve ser menor ou igual ao Teste 1)")
    print("Tickets por operador retornados:")
    for op_data in data3.get('tickets_por_operador', []):
        print(f" - {op_data['operador']}: {op_data['count']}")
