import mysql.connector
from mysql.connector import Error
import logging
import json
from uuid import uuid4

class DBUtil:

  @classmethod
  def __init__(cls):
    cls.connection_config_dict = {
        'user': 'root',
        'password': 'welcome1',
        'host': 'localhost',
        'database': 'spm2',
        'raise_on_warnings': True,
        'use_pure': True,
        'autocommit': False,
        'pool_size': 5
    }

  @classmethod
  def get_connection(cls):
    conn = None
    try:
      connection = mysql.connector.connect(**cls.connection_config_dict)
      if connection.is_connected():
          conn = connection
          db_Info = connection.get_server_info()
          #logging.info("Connected to MySQL Server version "+ str(db_Info))
    except Error as e:
        logging.error("Error while connecting to MySQL", e)
    finally:
      return conn

  @classmethod
  def get_hex_uuid(cls):
      return uuid4().hex.upper()

  @classmethod
  def execute_query(cls, query, data = None, executemany=False, commit= False, fetchOne= False):
    try:
      connection = cls.get_connection()
      if connection:
        cursor = connection.cursor()
        
        if executemany:
          cursor.executemany(query,data)
        else:
          cursor.execute(query, data)

        columns = cursor.description 
        result = [{columns[index][0]:column for index, column in enumerate(value)} for value in cursor.fetchall()]

        logging.info("Query: "+str(query)+"\nData: "+str(data))
        logging.info("Result: "+str(result))

        if commit:
          connection.commit()
        
        logging.info(cursor.rowcount, "record(s) affected")
        cursor.close()

        return result

    except mysql.connector.Error as error:
        logging.info("Failed to execute query {}. {}".format(query, error))

    finally:
        if connection.is_connected():
            connection.close()
