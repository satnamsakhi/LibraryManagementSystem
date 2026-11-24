try:
    import MySQLdb  # Provided by mysqlclient
except ImportError:
    import pymysql
    pymysql.install_as_MySQLdb()
