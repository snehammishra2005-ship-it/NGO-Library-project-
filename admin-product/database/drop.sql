-- =====================================================================
--  Tear-down — drop all objects in dependency order. Safe to re-run.
-- =====================================================================
BEGIN
  FOR t IN (
    SELECT table_name FROM user_tables
    WHERE table_name IN
      ('AUDIT_LOG','NOTIFY_REQUESTS','WISHLIST','MAINTENANCE_RECORDS',
       'INVOICES','BORROW_LOG','BOOKS','MEMBERS','STAFF')
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
  END LOOP;
END;
/
