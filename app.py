from flask import Flask, render_template, request, redirect ,url_for, session
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    'postgresql://'   # Conexão
    'postgres:'       # Usuário
    '123456@'         # Senha
    'localhost:5432/' # Caminho (host:porta)
    'ticketsystem'    # Banco
)

db.init_app(app) # aqui o banco vai inicializar o app.py
@app.route('/')
def index():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():

#ACESSO DO USUÁRIO: SUPORTE/ CLIENTE/ ADM


    LOGIN_SUPORTE = "suporte@gmail.com"
    SENHA_SUPORTE = '123'
    LOGIN_ADM = "adm@123"
    SENHA_ADM = "admin"
    LOGIN_CLIENTE = "teste@gmail.com"
    SENHA_CLIENTE = "teste"
    if request.method == 'POST':
        login = request.form['login']
        senha = request.form['senha']
        if login == LOGIN_SUPORTE and senha == SENHA_SUPORTE or login == LOGIN_CLIENTE and senha == SENHA_CLIENTE or login == LOGIN_ADM and senha == SENHA_ADM:
            return redirect(url_for('home'))  
        else:
            return redirect(url_for('login'))

    return render_template('/login.html')



@app.route('/inicio')
def home():
    return render_template('/home.html')

@app.route('/tickets')
def tickets():
    return render_template('/tickets.html')

@app.route('/cadastros')
def cadastros():
    return render_template('/cadastros.html')


app.run(host='0.0.0.0', port=8080, debug=True)