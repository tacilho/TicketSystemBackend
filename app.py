import datetime
import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'super-secret-key-ticket-system'

# Use SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ticketsystem.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload limit

db = SQLAlchemy()
db.init_app(app)

# --- MODELS ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'admin', 'operator', 'user'
    sector = db.Column(db.String(100), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'usuario': self.name,
            'email': self.email,
            'setor': self.sector,
            'nivel': self.role,
            'data': self.created_at.strftime('%d/%m/%Y')
        }

class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    sector = db.Column(db.String(100), nullable=True)
    username = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cliente': self.name,
            'email': self.email,
            'setor': self.sector,
            'usuario': self.username,
            'data': self.created_at.strftime('%d/%m/%Y')
        }

class Sector(db.Model):
    __tablename__ = 'sectors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    manager = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'setor': self.name,
            'responsavel': self.manager,
            'data': self.created_at.strftime('%d/%m/%Y')
        }

class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='aguardando') # 'aguardando', 'em_atendimento', 'concluido'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cliente': self.client_name,
            'titulo': self.title,
            'descricao': self.description,
            'status': self.status,
            'data': self.created_at.strftime('%d/%m/%Y')
        }

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender_name = db.Column(db.String(100), nullable=False)
    text = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'sender_id': self.sender_id,
            'sender_name': self.sender_name,
            'text': self.text,
            'image_path': self.image_path,
            'created_at': self.created_at.strftime('%H:%M - %d/%m/%Y')
        }

# --- DATABASE INITIALIZATION ---
with app.app_context():
    db.create_all()
    # Check if default users exist, if not, create them
    if not User.query.filter_by(email='suporte@gmail.com').first():
        support = User(name='Suporte', email='suporte@gmail.com', password=generate_password_hash('123'), role='operator', sector='T.I.')
        db.session.add(support)
    if not User.query.filter_by(email='adm@123').first():
        admin = User(name='Administrador', email='adm@123', password=generate_password_hash('admin'), role='admin', sector='Diretoria')
        db.session.add(admin)
    if not User.query.filter_by(email='teste@gmail.com').first():
        client_user = User(name='Pedro', email='teste@gmail.com', password=generate_password_hash('teste'), role='user', sector='Expedição')
        db.session.add(client_user)
        
    # Migrate existing plaintext passwords
    all_users = User.query.all()
    for u in all_users:
        if not u.password.startswith('scrypt:') and not u.password.startswith('pbkdf2:'):
            u.password = generate_password_hash(u.password)
        
    # Check if default sectors exist, if not, create them
    if not Sector.query.filter_by(name='Expedição').first():
        expedicao = Sector(name='Expedição', manager='Gabriel Otacilio')
        db.session.add(expedicao)

    # Check if default clients exist, if not, create them
    if not Client.query.filter_by(name='Gabriel Otacilio').first():
        gabriel = Client(name='Gabriel Otacilio', email='gabriel.trans@gmail.com', sector='Expedição', username='Gabriel Otacilio')
        db.session.add(gabriel)

    # Check if default tickets exist, if not, create them
    if not Ticket.query.first():
        t1 = Ticket(client_name='Jair Bolsonaro', title='Queda da Rede', description='A internet caiu no setor de faturamento. Computadores sem acesso ao sistema local.', status='aguardando')
        t2 = Ticket(client_name='Maria Silva', title='Impressora com Erro', description='A impressora do RH está atolando papel toda vez que tentamos imprimir o espelho de ponto.', status='aguardando')
        t3 = Ticket(client_name='Pedro', title='Acesso Negado', description='Não consigo fazer login no sistema ERP, diz que a senha expirou.', status='em_atendimento')
        db.session.add_all([t1, t2, t3])

    db.session.commit()

# --- WEB TEMPLATE ROUTES ---
@app.route('/')
def index():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            if user.role == 'user':
                return redirect(url_for('tickets'))
            return redirect(url_for('home'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        login_val = request.form.get('login')
        senha_val = request.form.get('senha')
        
        user = User.query.filter_by(email=login_val, active=True).first()
        if user and check_password_hash(user.password, senha_val):
            session['user_id'] = user.id
            if user.role == 'user':
                return redirect(url_for('tickets'))
            return redirect(url_for('home'))
        else:
            return redirect(url_for('login', error='invalid'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/inicio')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    if not user or user.role == 'user':
        return redirect(url_for('tickets'))
    return render_template('home.html')

@app.route('/tickets')
def tickets():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('tickets.html')

@app.route('/cadastros')
def cadastros():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    if not user or user.role != 'admin':
        return redirect(url_for('home'))
    return render_template('cadastros.html')

@app.route('/relatorios')
def relatorios():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    if not user or user.role == 'user':
        return redirect(url_for('home'))
    return render_template('relatorios.html')

# --- API ENDPOINTS ---
@app.route('/api/me')
def api_me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário inválido'}), 401
    return jsonify({
        'name': user.name,
        'role': user.role,
        'email': user.email
    })

@app.route('/api/stats')
def api_stats():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    
    # Calculate stats
    abertos = Ticket.query.filter_by(status='aguardando').count()
    pendentes = Ticket.query.filter_by(status='em_atendimento').count()
    return jsonify({
        'abertos': abertos,
        'pendentes': pendentes
    })

@app.route('/api/reports')
def api_reports():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    user = User.query.get(user_id)
    if not user or user.role == 'user':
        return jsonify({'error': 'Acesso negado'}), 403

    total = Ticket.query.count()
    aguardando = Ticket.query.filter_by(status='aguardando').count()
    em_atendimento = Ticket.query.filter_by(status='em_atendimento').count()
    concluido = Ticket.query.filter_by(status='concluido').count()

    from sqlalchemy import func
    cliente_counts = db.session.query(Ticket.client_name, func.count(Ticket.id)).group_by(Ticket.client_name).all()
    tickets_por_cliente = [{'cliente': c[0], 'count': c[1]} for c in cliente_counts]

    tickets_por_status = [
        {'status': 'Aguardando', 'count': aguardando},
        {'status': 'Em Atendimento', 'count': em_atendimento},
        {'status': 'Concluído', 'count': concluido}
    ]

    return jsonify({
        'total': total,
        'aguardando': aguardando,
        'em_atendimento': em_atendimento,
        'concluido': concluido,
        'tickets_por_cliente': tickets_por_cliente,
        'tickets_por_status': tickets_por_status
    })

@app.route('/api/tickets', methods=['GET', 'POST'])
def api_tickets():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    
    user = User.query.get(user_id)
    if request.method == 'GET':
        if user.role == 'user':
            tickets = Ticket.query.filter_by(client_name=user.name).all()
        else:
            tickets = Ticket.query.all()
        return jsonify([t.to_dict() for t in tickets])
        
    elif request.method == 'POST':
        data = request.json
        if not data or not data.get('titulo') or not data.get('descricao'):
            return jsonify({'error': 'Dados incompletos'}), 400
            
        new_ticket = Ticket(
            client_name=user.name,
            title=data['titulo'],
            description=data['descricao'],
            status='aguardando'
        )
        db.session.add(new_ticket)
        db.session.commit()
        return jsonify(new_ticket.to_dict()), 201

@app.route('/api/tickets/<int:id>/status', methods=['PUT'])
def api_ticket_status(id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    
    ticket = Ticket.query.get_or_404(id)
    data = request.json
    if not data or not data.get('status'):
        return jsonify({'error': 'Dados incompletos'}), 400
        
    if ticket.status != data['status']:
        ticket.status = data['status']
        user = User.query.get(user_id)
        sys_msg = Message(
            ticket_id=ticket.id,
            sender_id=user.id,
            sender_name='Sistema',
            text=f"Status alterado para '{data['status']}' por {user.name}."
        )
        db.session.add(sys_msg)
    
    db.session.commit()
    return jsonify(ticket.to_dict())

@app.route('/api/users', methods=['GET', 'POST'])
def api_users():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    
    if request.method == 'GET':
        users = User.query.filter_by(active=True).all()
        return jsonify([u.to_dict() for u in users])
        
    elif request.method == 'POST':
        data = request.json
        name = data.get('usuario')
        email = data.get('email')
        password = data.get('senha')
        role = data.get('nivel', 'user')
        sector = data.get('setor')
        
        if not name or not email or not password:
            return jsonify({'error': 'Dados incompletos'}), 400
            
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'E-mail já cadastrado'}), 400
            
        hashed_password = generate_password_hash(password)
        new_user = User(name=name, email=email, password=hashed_password, role=role, sector=sector)
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201

@app.route('/api/users/<int:id>', methods=['PUT', 'DELETE'])
def api_manage_user(id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
        
    current_user = User.query.get(user_id)
    if current_user.role != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
        
    target_user = User.query.get_or_404(id)
    
    if request.method == 'DELETE':
        if target_user.id == current_user.id:
            return jsonify({'error': 'Não pode excluir a si mesmo'}), 400
        target_user.active = False
        db.session.commit()
        return jsonify({'success': True})
        
    data = request.json
    target_user.name = data.get('usuario', target_user.name)
    target_user.email = data.get('email', target_user.email)
    target_user.sector = data.get('setor', target_user.sector)
    target_user.role = data.get('nivel', target_user.role)
    if data.get('senha'):
        target_user.password = generate_password_hash(data['senha'])
    db.session.commit()
    return jsonify(target_user.to_dict())

@app.route('/api/clients/<int:id>', methods=['PUT', 'DELETE'])
def api_manage_client(id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    current_user = User.query.get(user_id)
    if current_user.role != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
    target_client = Client.query.get_or_404(id)
    
    if request.method == 'DELETE':
        db.session.delete(target_client)
        db.session.commit()
        return jsonify({'success': True})
        
    data = request.json
    target_client.name = data.get('cliente', target_client.name)
    target_client.email = data.get('email', target_client.email)
    target_client.username = data.get('usuario', target_client.username)
    target_client.sector = data.get('setor', target_client.sector)
    db.session.commit()
    return jsonify(target_client.to_dict())

@app.route('/api/clients', methods=['GET', 'POST'])
def api_clients():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
        
    if request.method == 'GET':
        clients = Client.query.all()
        return jsonify([c.to_dict() for c in clients])
        
    elif request.method == 'POST':
        data = request.json
        name = data.get('cliente')
        email = data.get('email')
        username = data.get('usuario')
        sector = data.get('setor')
        
        if not name or not email or not username:
            return jsonify({'error': 'Dados incompletos'}), 400
            
        new_client = Client(name=name, email=email, username=username, sector=sector)
        db.session.add(new_client)
        
        if not User.query.filter_by(email=email).first():
            hashed_password = generate_password_hash('123')
            new_user = User(name=name, email=email, password=hashed_password, role='user', sector=sector)
            db.session.add(new_user)
            
        db.session.commit()
        return jsonify(new_client.to_dict()), 201

@app.route('/api/sectors/<int:id>', methods=['PUT', 'DELETE'])
def api_manage_sector(id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    current_user = User.query.get(user_id)
    if current_user.role != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
    target_sector = Sector.query.get_or_404(id)
    
    if request.method == 'DELETE':
        db.session.delete(target_sector)
        db.session.commit()
        return jsonify({'success': True})
        
    data = request.json
    target_sector.name = data.get('setor', target_sector.name)
    target_sector.manager = data.get('responsavel', target_sector.manager)
    db.session.commit()
    return jsonify(target_sector.to_dict())

@app.route('/api/sectors', methods=['GET', 'POST'])
def api_sectors():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
        
    if request.method == 'GET':
        sectors = Sector.query.all()
        return jsonify([s.to_dict() for s in sectors])
        
    elif request.method == 'POST':
        data = request.json
        name = data.get('setor')
        manager = data.get('responsavel')
        
        if not name or not manager:
            return jsonify({'error': 'Dados incompletos'}), 400
            
        new_sector = Sector(name=name, manager=manager)
        db.session.add(new_sector)
        db.session.commit()
        return jsonify(new_sector.to_dict()), 201

@app.route('/api/check-email', methods=['POST'])
def api_check_email():
    data = request.json
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if user:
        session['reset_email'] = email
        return jsonify({'success': True})
    return jsonify({'error': 'E-mail não encontrado'}), 404

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    data = request.json
    new_password = data.get('password')
    email = session.get('reset_email')
    if not email:
        return jsonify({'error': 'Sessão de redefinição expirada'}), 400
    user = User.query.filter_by(email=email, active=True).first()
    if user:
        user.password = generate_password_hash(new_password)
        db.session.commit()
        session.pop('reset_email', None)
        return jsonify({'success': True})
    return jsonify({'error': 'Usuário não encontrado'}), 404

@app.route('/api/tickets/<int:ticket_id>/messages', methods=['GET'])
def get_messages(ticket_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    
    user = User.query.get(user_id)
    ticket = Ticket.query.get_or_404(ticket_id)
    if user.role == 'user' and ticket.client_name != user.name:
        return jsonify({'error': 'Acesso negado'}), 403
        
    messages = Message.query.filter_by(ticket_id=ticket_id).order_by(Message.created_at.asc()).all()
    return jsonify([m.to_dict() for m in messages])

@app.route('/api/tickets/<int:ticket_id>/messages', methods=['POST'])
def send_message(ticket_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Não logado'}), 401
    
    user = User.query.get(user_id)
    ticket = Ticket.query.get_or_404(ticket_id)
    if user.role == 'user' and ticket.client_name != user.name:
        return jsonify({'error': 'Acesso negado'}), 403
        
    if ticket.status == 'concluido':
        return jsonify({'error': 'Não é possível enviar mensagens. Este ticket já está concluído.'}), 400
        
    text = request.form.get('text', '').strip()
    image_file = request.files.get('image')
    
    if not text and not image_file:
        return jsonify({'error': 'Mensagem vazia'}), 400
        
    image_path = None
    if image_file:
        filename = secure_filename(image_file.filename)
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
        filename = f"{timestamp}_{filename}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(save_path)
        image_path = f"/static/uploads/{filename}"
        
    new_message = Message(
        ticket_id=ticket_id,
        sender_id=user.id,
        sender_name=user.name,
        text=text if text else None,
        image_path=image_path
    )
    db.session.add(new_message)
    db.session.commit()
    return jsonify(new_message.to_dict()), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)