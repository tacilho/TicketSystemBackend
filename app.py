from flask import Flask, render_template, request


app = Flask(__name__)



@app.route('/login')
def login():
    return render_template('/login.html')

@app.route('/inicio')
def home():
    return render_template('/home.html')

@app.route('/tickets')
def tickets():
    return render_template('/tickets.html')



app.run(host='0.0.0.0', port=8080)