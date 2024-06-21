from datetime import datetime
import os

now = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
        


#######################################
############# SET LOGGING #############
#######################################

from logging.handlers import RotatingFileHandler
import logging

def set_logging():
    # Set the log location
    log_folder_path = "python/log/"
    log_file_path = "mqtt_charging_session.log"
    log_location = log_folder_path + log_file_path

    # Check if folder for log DOESN'T exists
    if not os.path.isdir(log_folder_path):
        # Create the log folder
        os.makedirs(log_folder_path)

    # Set the log file max size
    log_max_size = 5 * 1024 * 1024
    # Set the log format
    log_format = "%(asctime)s %(levelname)s %(message)s"

    # Set the log handler
    rfh = RotatingFileHandler(
        log_location,
        mode="a",
        maxBytes=log_max_size,
        backupCount=3,
        encoding=None,
        delay=0
    )

    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            rfh
        ]
    )

###########################################
############# END SET LOGGING #############
###########################################
    


########################################################
############# POSTGRESQL DATABASE SETTINGS #############
########################################################
        
import psycopg2
import psycopg2.extras

def set_db(db_name, db_host, db_port, db_user, db_pw):
    try:
        connection = psycopg2.connect(database=db_name, host=db_host, port=db_port, user=db_user, password=db_pw)

        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        return connection, cursor
    
    except Exception as e:
        logging.error("Error connecting to database: ", e)

    except:
        logging.error(f"Error connecting to database: {db_name} {db_host}:{db_port}")
        logging.error("Terminating the script")
        exit()

############################################################
############# END POSTGRESQL DATABASE SETTINGS #############
############################################################



################################################
############# TEST PORT CONNECTION #############
################################################

import socket

def test_connection(ip, port):
    try:
        # Create a new socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        # Set a timeout for the connection attempt
        s.settimeout(5)
        
        # Attempt to connect to the IP address and port
        s.connect((ip, port))
        
        # Connection successful
        logging.info(f"Connection to {ip}:{port} successful.")
        
        # Close the socket
        s.close()
        
        return True
        
    except socket.error as e:
        # Connection failed
        logging.error(f"Connection to {ip}:{port} failed: {e}")
        return False
    
####################################################
############# END TEST PORT CONNECTION #############
####################################################