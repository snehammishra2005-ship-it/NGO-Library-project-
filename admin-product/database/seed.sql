-- =====================================================================
--  Seed data for the Library schema. GENERATED FILE — do not edit by hand.
--  Regenerate with: node backend/src/scripts/generateSeedSql.js
--  Staff: admin@library.test/admin123, staff@library.test/staff123
--  Members with online login use password: reader123
-- =====================================================================

-- Staff
INSERT INTO staff (name, email, password_hash, role, added_by_staff_id) VALUES ('Priya Menon', 'admin@library.test', '$2a$10$OWsqVK8fVse8ZG2wgCUUCOJkHCC.gMaYdAIaK2HD9aMjEnR2HbQvy', 'ADMIN', NULL);
INSERT INTO staff (name, email, password_hash, role, added_by_staff_id) VALUES ('Rahul Desai', 'staff@library.test', '$2a$10$7OSFmC0vy3s3NW.Ph6.g0ee/N1NMb9R.KuIJNAgOo7PbroGgnBRri', 'FRONT_DESK', (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));

-- Members (password_hash NULL = walk-in, no online login)
INSERT INTO members (name, email, phone, password_hash, membership_status, membership_start, membership_expiry) VALUES ('Aarav Sharma', 'aarav@reader.test', '+91 90000 11111', '$2a$10$.sRXHemD40/.mgOFAmkr/eAdF0OwqfGfByS8imhVjf9sQtak3Nm4m', 'ACTIVE', TRUNC(SYSDATE) - 390, TRUNC(SYSDATE) + 360);
INSERT INTO members (name, email, phone, password_hash, membership_status, membership_start, membership_expiry) VALUES ('Diya Patel', 'diya@reader.test', '+91 90000 22222', '$2a$10$oZjaHBYMgQuCKE8S5gc7T.EIDHOoJ6ktgduoJDZ17MUOKHiQRBVgC', 'ACTIVE', TRUNC(SYSDATE) - 210, TRUNC(SYSDATE) + 180);
INSERT INTO members (name, email, phone, password_hash, membership_status, membership_start, membership_expiry) VALUES ('Kabir Rao', 'kabir@reader.test', '+91 90000 33333', '$2a$10$Ro7DlFEncYnt3M0SbdHhK.L68jM7ZfVquH8DGes3a/tLMJ4QC9Yia', 'EXPIRED', TRUNC(SYSDATE) + 90, TRUNC(SYSDATE) - 60);
INSERT INTO members (name, email, phone, password_hash, membership_status, membership_start, membership_expiry) VALUES ('Meera Nair', 'meera@reader.test', '+91 90000 44444', '$2a$10$CRl.tgnoHu1dPGl00Q2y.e1BJiw5O1d2FMVcW1omRnTWWTpddoJ4W', 'PENDING', NULL, NULL);
INSERT INTO members (name, email, phone, password_hash, membership_status, membership_start, membership_expiry) VALUES ('Ishaan Gupta', 'ishaan@reader.test', '+91 90000 55555', NULL, 'ACTIVE', TRUNC(SYSDATE) - 120, TRUNC(SYSDATE) + 90);

-- Books (status set automatically by trg_books_status)
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Silent Library', 'Anita Rao', '9780000000001', 'Fiction', 'A quiet town, a vanishing librarian, and the books that remember everything.', 'A1-04', 3, 2);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Midnight in Bombay', 'Rohan Iyer', '9780000000002', 'Mystery', 'A detective story stitched through the night markets of a restless city.', 'B2-11', 2, 0);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Roots and Monsoon', 'Lata Krishnan', '9780000000003', 'Literary', 'Three generations of a family told across three monsoons.', 'A3-07', 4, 4);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Cartographer’s Daughter', 'Samuel Fernandes', '9780000000004', 'Historical', 'Maps hide more than they reveal in this sweeping colonial-era tale.', 'C1-02', 2, 1);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Algorithms of the Heart', 'Nisha Verma', '9780000000005', 'Romance', 'Two coders, one open-source project, and a very unromantic merge conflict.', 'D4-09', 5, 3);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Last Archive', 'David Thomas', '9780000000006', 'Science Fiction', 'When all knowledge lives in one server, someone decides to pull the plug.', 'E2-15', 3, 0);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Spices and Silence', 'Fatima Sheikh', '9780000000007', 'Fiction', 'A cookbook becomes a coded diary of a woman’s hidden life.', 'A1-12', 2, 2);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Grammar of Rivers', 'Anita Rao', '9780000000008', 'Poetry', 'Poems that trace water from the mountains to the sea.', 'F1-01', 1, 1);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Quantum Gardens', 'Vikram Sethi', '9780000000009', 'Science Fiction', 'A botanist grows plants that exist in two places at once.', 'E2-03', 2, 1);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Letters Never Sent', 'Meghna Bose', '9780000000010', 'Literary', 'A drawer of unsent letters unravels a decades-old misunderstanding.', 'A3-18', 3, 0);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Iron Ledger', 'Samuel Fernandes', '9780000000011', 'Historical', 'The rise and ruin of a merchant dynasty, told through its account books.', 'C1-08', 2, 2);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Debugging the Universe', 'Nisha Verma', '9780000000012', 'Non-fiction', 'A playful tour of the biggest unsolved problems in physics and computing.', 'G2-05', 4, 4);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Monsoon Radio', 'Rohan Iyer', '9780000000013', 'Fiction', 'A pirate radio station keeps a flooded city company for one long season.', 'A1-20', 3, 1);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Weight of Maps', 'Lata Krishnan', '9780000000014', 'Literary', 'A geographer who can’t find her way home.', 'A3-22', 2, 0);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Saltwater Saints', 'Fatima Sheikh', '9780000000015', 'Historical', 'Fishing villages, faith, and the sea that takes as much as it gives.', 'C1-14', 3, 2);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Notebook of Small Machines', 'Vikram Sethi', '9780000000016', 'Non-fiction', 'How everyday devices work, sketched by hand and explained simply.', 'G2-11', 2, 2);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Nightjar', 'Meghna Bose', '9780000000017', 'Mystery', 'A birdwatcher witnesses something she was never meant to see.', 'B2-06', 4, 3);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Paper Boat Fleet', 'David Thomas', '9780000000018', 'Children', 'A gentle adventure about a child’s armada of paper boats.', 'H1-02', 6, 5);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('Ashes and Almanacs', 'Anita Rao', '9780000000019', 'Poetry', 'A year of grief and renewal, one poem per week.', 'F1-09', 1, 0);
INSERT INTO books (title, author, isbn, genre, description, shelf_location, total_copies, available_copies) VALUES ('The Open Stacks', 'Priya Menon', '9780000000020', 'Non-fiction', 'A love letter to public libraries and the people who keep them alive.', 'G2-19', 3, 3);

-- Borrow log (open loans)
INSERT INTO borrow_log (book_id, member_id, issued_on, due_on, handled_by_staff_id) VALUES ((SELECT book_id FROM books WHERE isbn = '9780000000002'), (SELECT member_id FROM members WHERE email = 'aarav@reader.test'), SYSTIMESTAMP - 20, SYSTIMESTAMP - 6, (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO borrow_log (book_id, member_id, issued_on, due_on, handled_by_staff_id) VALUES ((SELECT book_id FROM books WHERE isbn = '9780000000006'), (SELECT member_id FROM members WHERE email = 'diya@reader.test'), SYSTIMESTAMP - 5, SYSTIMESTAMP - -9, (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO borrow_log (book_id, member_id, issued_on, due_on, handled_by_staff_id) VALUES ((SELECT book_id FROM books WHERE isbn = '9780000000010'), (SELECT member_id FROM members WHERE email = 'kabir@reader.test'), SYSTIMESTAMP - 30, SYSTIMESTAMP - 16, (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));

-- Notify-me requests
INSERT INTO notify_requests (book_id, member_id) VALUES ((SELECT book_id FROM books WHERE isbn = '9780000000002'), (SELECT member_id FROM members WHERE email = 'meera@reader.test'));
INSERT INTO notify_requests (book_id, member_id) VALUES ((SELECT book_id FROM books WHERE isbn = '9780000000006'), (SELECT member_id FROM members WHERE email = 'ishaan@reader.test'));

-- Wishlist
INSERT INTO wishlist (member_id, book_id) VALUES ((SELECT member_id FROM members WHERE email = 'aarav@reader.test'), (SELECT book_id FROM books WHERE isbn = '9780000000003'));
INSERT INTO wishlist (member_id, book_id) VALUES ((SELECT member_id FROM members WHERE email = 'aarav@reader.test'), (SELECT book_id FROM books WHERE isbn = '9780000000012'));
INSERT INTO wishlist (member_id, book_id) VALUES ((SELECT member_id FROM members WHERE email = 'diya@reader.test'), (SELECT book_id FROM books WHERE isbn = '9780000000017'));

-- Invoices
INSERT INTO invoices (member_id, type, amount, payment_status, notes, generated_by_staff_id) VALUES ((SELECT member_id FROM members WHERE email = 'aarav@reader.test'), 'MEMBERSHIP_FEE', 500, 'PAID', 'Annual membership 2026', (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO invoices (member_id, type, amount, payment_status, notes, generated_by_staff_id) VALUES ((SELECT member_id FROM members WHERE email = 'diya@reader.test'), 'MEMBERSHIP_FEE', 300, 'PAID', '6-month membership', (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO invoices (member_id, type, amount, payment_status, notes, generated_by_staff_id) VALUES ((SELECT member_id FROM members WHERE email = 'kabir@reader.test'), 'FINE', 40, 'UNPAID', 'Overdue: Letters Never Sent', (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO invoices (member_id, type, amount, payment_status, notes, generated_by_staff_id) VALUES ((SELECT member_id FROM members WHERE email = 'aarav@reader.test'), 'FINE', 20, 'UNPAID', 'Overdue: Midnight in Bombay', (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));

-- Maintenance records
INSERT INTO maintenance_records (book_id, asset_name, category, description, cost, logged_by_staff_id) VALUES ((SELECT book_id FROM books WHERE isbn = '9780000000019'), NULL, 'BOOK_DAMAGE', 'Water-damaged spine, front desk copy', 150, (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO maintenance_records (book_id, asset_name, category, description, cost, logged_by_staff_id) VALUES (NULL, 'Reading room printer', 'EQUIPMENT', 'Toner replacement + service', 1200, (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));
INSERT INTO maintenance_records (book_id, asset_name, category, description, cost, logged_by_staff_id) VALUES (NULL, 'Aisle C shelving', 'FACILITY', 'Re-levelled and re-anchored bracket', 800, (SELECT staff_id FROM staff WHERE email = 'admin@library.test'));

COMMIT;
