from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    # Read the JSON file and return it as a response
    with open('ecosonar-output.json', 'r') as file:
        data = file.read()
    json_object = json.loads(data)
    return json_object

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True)
