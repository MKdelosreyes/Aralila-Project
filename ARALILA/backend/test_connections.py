# SUPABASE
# Project name : HERHEALTH
# DatabasePassword  : VzfUcKJ4a2q54wm1

import psycopg2
from psycopg2.extras import RealDictCursor
import os

class Database:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.connect()

    def connect(self):
        """Establish a connection to the database."""
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.sovnysawenldkipowbia:Aralila12325@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres")
    #   DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres.vgdifuwzjwlowxbwcsbz:Bloodbuddy@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres")
        try:
            self.conn = psycopg2.connect(DATABASE_URL)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("✅ Successfully connected to the database.")
        except psycopg2.Error as e:
            print(f"❌ Database connection error: {e}")
            self.conn = None
            self.cursor = None

    def execute_query(self, query, params=()):
        """Executes a query and commits if needed."""
        if not self.cursor:
            self.connect()
        try:
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor
        except psycopg2.Error as e:
            print(f"❌ Database error: {e}")
            return None

    def fetch_all(self, query, params=()):
        """Executes a query and returns all results."""
        cursor = self.execute_query(query, params)
        return cursor.fetchall() if cursor else []

    def fetch_one(self, query, params=()):
        """Executes a query and returns a single result."""
        cursor = self.execute_query(query, params)
        return cursor.fetchone() if cursor else None

    def close(self):
        """Closes the database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
            print("🔌 Database connection closed.")
    
    def test_connection(self):
        """Test the connection by running a simple query."""
        result = self.fetch_one("SELECT 1")
        if result:
            print("✅ Connection test successful.")
        else:
            print("❌ Connection test failed.")



if __name__ == "__main__":
    db = Database()
    db.test_connection()
    db.close()