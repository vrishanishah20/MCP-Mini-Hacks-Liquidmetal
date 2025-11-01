"""
Main backend application entry point
Flask API server for the Chicago Real Estate Chatbot
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('CORS_ORIGINS', '*').split(','))


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages from the frontend
    Process user queries and return LLM responses
    """
    data = request.json
    user_message = data.get('message', '')

    # TODO: Process message with LLM
    # TODO: Query MCP server for relevant data
    # TODO: Generate response

    return jsonify({
        'response': 'This is a placeholder response',
        'data': {}
    })


@app.route('/api/neighborhoods', methods=['GET'])
def get_neighborhoods():
    """
    Get list of Chicago neighborhoods with basic info
    """
    # TODO: Fetch neighborhood data
    return jsonify({
        'neighborhoods': []
    })


@app.route('/api/housing/<neighborhood>', methods=['GET'])
def get_housing_data(neighborhood):
    """
    Get affordable housing data for a specific neighborhood
    """
    # TODO: Query housing dataset
    return jsonify({
        'neighborhood': neighborhood,
        'housing': []
    })


@app.route('/api/crime/<neighborhood>', methods=['GET'])
def get_crime_data(neighborhood):
    """
    Get crime statistics for a specific neighborhood
    """
    # TODO: Query crime dataset
    return jsonify({
        'neighborhood': neighborhood,
        'crime_stats': {}
    })


@app.route('/api/311/<neighborhood>', methods=['GET'])
def get_311_data(neighborhood):
    """
    Get 311 call data for a specific neighborhood
    """
    # TODO: Query 311 dataset
    return jsonify({
        'neighborhood': neighborhood,
        'calls_311': []
    })


@app.route('/api/dashboard/<neighborhood>', methods=['GET'])
def get_dashboard_data(neighborhood):
    """
    Get comprehensive dashboard data for a neighborhood
    Combines housing, crime, and 311 data
    """
    # TODO: Aggregate all data sources
    return jsonify({
        'neighborhood': neighborhood,
        'housing': [],
        'crime': {},
        'calls_311': [],
        'summary': {}
    })


if __name__ == '__main__':
    port = int(os.getenv('BACKEND_PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
