from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash
app = Flask(__name__)
app.secret_key="pm30c6DBBOpmA4A4PmJw"

@app.route("/")
def home():
    return render_template('index.html')

if __name__=="__main__":
    app.run(host="0.0.0.0")
