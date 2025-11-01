"""
LLM integration for handling chatbot conversations
"""

import os
from typing import Dict, List, Optional


class ChatHandler:
    """Handle chat interactions with LLM"""

    def __init__(self, provider: str = 'anthropic'):
        """
        Initialize chat handler

        Args:
            provider: LLM provider ('anthropic' or 'openai')
        """
        self.provider = provider

        if provider == 'anthropic':
            self.api_key = os.getenv('ANTHROPIC_API_KEY')
            # TODO: Initialize Anthropic client
        elif provider == 'openai':
            self.api_key = os.getenv('OPENAI_API_KEY')
            # TODO: Initialize OpenAI client

        self.conversation_history = []

    def generate_response(self, user_message: str, context: Optional[Dict] = None) -> str:
        """
        Generate LLM response to user message

        Args:
            user_message: User's message
            context: Optional context data (neighborhood info, etc.)

        Returns:
            LLM generated response
        """
        # TODO: Build prompt with context
        # TODO: Call LLM API
        # TODO: Parse and return response
        pass

    def extract_neighborhood(self, message: str) -> Optional[str]:
        """
        Extract neighborhood name from user message

        Args:
            message: User's message

        Returns:
            Extracted neighborhood name or None
        """
        # TODO: Use LLM to extract neighborhood
        pass

    def format_dashboard_data(self, data: Dict) -> str:
        """
        Format dashboard data for LLM context

        Args:
            data: Dashboard data dictionary

        Returns:
            Formatted string for LLM prompt
        """
        # TODO: Format data into readable text
        pass

    def get_house_prices(self, address: str) -> List[Dict]:
        """
        Retrieve house prices for a specific address from the internet

        Args:
            address: Full address string

        Returns:
            List of house options with prices
        """
        # TODO: Implement web scraping or API call for house prices
        # TODO: Use LLM to parse and structure results
        pass
