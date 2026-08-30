// ---------------------------------------------------------------------
//  Canonical seed dataset. Shared by the in-memory store (hashed at load)
//  and mirrored by database/seed.sql for Oracle. Passwords are plaintext
//  here ON PURPOSE — they are hashed with bcrypt before ever being stored.
// ---------------------------------------------------------------------

export const seedStaff = [
  { name: 'Priya Menon', email: 'admin@library.test', password: 'admin123', role: 'ADMIN' },
  { name: 'Rahul Desai', email: 'staff@library.test', password: 'staff123', role: 'FRONT_DESK' },
];

// Members. Some have an online account (password set) + a paid membership.
// membership_status: PENDING | ACTIVE | EXPIRED | SUSPENDED
export const seedMembers = [
  { name: 'Aarav Sharma', email: 'aarav@reader.test',  phone: '+91 90000 11111', password: 'reader123', membership_status: 'ACTIVE',  months: 12 },
  { name: 'Diya Patel',   email: 'diya@reader.test',   phone: '+91 90000 22222', password: 'reader123', membership_status: 'ACTIVE',  months: 6 },
  { name: 'Kabir Rao',    email: 'kabir@reader.test',  phone: '+91 90000 33333', password: 'reader123', membership_status: 'EXPIRED', months: -2 },
  { name: 'Meera Nair',   email: 'meera@reader.test',  phone: '+91 90000 44444', password: 'reader123', membership_status: 'PENDING', months: 0 },
  { name: 'Ishaan Gupta', email: 'ishaan@reader.test', phone: '+91 90000 55555', password: null,        membership_status: 'ACTIVE',  months: 3 },
];

export const seedBooks = [
  { title: 'The Silent Library', author: 'Anita Rao', isbn: '9780000000001', genre: 'Fiction', shelf_location: 'A1-04', total_copies: 3, available_copies: 2, description: 'A quiet town, a vanishing librarian, and the books that remember everything.' },
  { title: 'Midnight in Bombay', author: 'Rohan Iyer', isbn: '9780000000002', genre: 'Mystery', shelf_location: 'B2-11', total_copies: 2, available_copies: 0, description: 'A detective story stitched through the night markets of a restless city.' },
  { title: 'Roots and Monsoon', author: 'Lata Krishnan', isbn: '9780000000003', genre: 'Literary', shelf_location: 'A3-07', total_copies: 4, available_copies: 4, description: 'Three generations of a family told across three monsoons.' },
  { title: 'The Cartographer’s Daughter', author: 'Samuel Fernandes', isbn: '9780000000004', genre: 'Historical', shelf_location: 'C1-02', total_copies: 2, available_copies: 1, description: 'Maps hide more than they reveal in this sweeping colonial-era tale.' },
  { title: 'Algorithms of the Heart', author: 'Nisha Verma', isbn: '9780000000005', genre: 'Romance', shelf_location: 'D4-09', total_copies: 5, available_copies: 3, description: 'Two coders, one open-source project, and a very unromantic merge conflict.' },
  { title: 'The Last Archive', author: 'David Thomas', isbn: '9780000000006', genre: 'Science Fiction', shelf_location: 'E2-15', total_copies: 3, available_copies: 0, description: 'When all knowledge lives in one server, someone decides to pull the plug.' },
  { title: 'Spices and Silence', author: 'Fatima Sheikh', isbn: '9780000000007', genre: 'Fiction', shelf_location: 'A1-12', total_copies: 2, available_copies: 2, description: 'A cookbook becomes a coded diary of a woman’s hidden life.' },
  { title: 'The Grammar of Rivers', author: 'Anita Rao', isbn: '9780000000008', genre: 'Poetry', shelf_location: 'F1-01', total_copies: 1, available_copies: 1, description: 'Poems that trace water from the mountains to the sea.' },
  { title: 'Quantum Gardens', author: 'Vikram Sethi', isbn: '9780000000009', genre: 'Science Fiction', shelf_location: 'E2-03', total_copies: 2, available_copies: 1, description: 'A botanist grows plants that exist in two places at once.' },
  { title: 'Letters Never Sent', author: 'Meghna Bose', isbn: '9780000000010', genre: 'Literary', shelf_location: 'A3-18', total_copies: 3, available_copies: 0, description: 'A drawer of unsent letters unravels a decades-old misunderstanding.' },
  { title: 'The Iron Ledger', author: 'Samuel Fernandes', isbn: '9780000000011', genre: 'Historical', shelf_location: 'C1-08', total_copies: 2, available_copies: 2, description: 'The rise and ruin of a merchant dynasty, told through its account books.' },
  { title: 'Debugging the Universe', author: 'Nisha Verma', isbn: '9780000000012', genre: 'Non-fiction', shelf_location: 'G2-05', total_copies: 4, available_copies: 4, description: 'A playful tour of the biggest unsolved problems in physics and computing.' },
  { title: 'Monsoon Radio', author: 'Rohan Iyer', isbn: '9780000000013', genre: 'Fiction', shelf_location: 'A1-20', total_copies: 3, available_copies: 1, description: 'A pirate radio station keeps a flooded city company for one long season.' },
  { title: 'The Weight of Maps', author: 'Lata Krishnan', isbn: '9780000000014', genre: 'Literary', shelf_location: 'A3-22', total_copies: 2, available_copies: 0, description: 'A geographer who can’t find her way home.' },
  { title: 'Saltwater Saints', author: 'Fatima Sheikh', isbn: '9780000000015', genre: 'Historical', shelf_location: 'C1-14', total_copies: 3, available_copies: 2, description: 'Fishing villages, faith, and the sea that takes as much as it gives.' },
  { title: 'The Notebook of Small Machines', author: 'Vikram Sethi', isbn: '9780000000016', genre: 'Non-fiction', shelf_location: 'G2-11', total_copies: 2, available_copies: 2, description: 'How everyday devices work, sketched by hand and explained simply.' },
  { title: 'Nightjar', author: 'Meghna Bose', isbn: '9780000000017', genre: 'Mystery', shelf_location: 'B2-06', total_copies: 4, available_copies: 3, description: 'A birdwatcher witnesses something she was never meant to see.' },
  { title: 'The Paper Boat Fleet', author: 'David Thomas', isbn: '9780000000018', genre: 'Children', shelf_location: 'H1-02', total_copies: 6, available_copies: 5, description: 'A gentle adventure about a child’s armada of paper boats.' },
  { title: 'Ashes and Almanacs', author: 'Anita Rao', isbn: '9780000000019', genre: 'Poetry', shelf_location: 'F1-09', total_copies: 1, available_copies: 0, description: 'A year of grief and renewal, one poem per week.' },
  { title: 'The Open Stacks', author: 'Priya Menon', isbn: '9780000000020', genre: 'Non-fiction', shelf_location: 'G2-19', total_copies: 3, available_copies: 3, description: 'A love letter to public libraries and the people who keep them alive.' },
];

// Open physical loans (returned_on = null). daysAgo issued; dueInDays from issue.
export const seedBorrowLog = [
  { isbn: '9780000000002', memberIndex: 0, daysAgo: 20, dueInDays: 14 }, // overdue
  { isbn: '9780000000006', memberIndex: 1, daysAgo: 5,  dueInDays: 14 },
  { isbn: '9780000000010', memberIndex: 2, daysAgo: 30, dueInDays: 14 }, // overdue
];

export const seedNotifyRequests = [
  { isbn: '9780000000002', memberIndex: 3 },
  { isbn: '9780000000006', memberIndex: 4 },
];

export const seedWishlist = [
  { isbn: '9780000000003', memberIndex: 0 },
  { isbn: '9780000000012', memberIndex: 0 },
  { isbn: '9780000000017', memberIndex: 1 },
];

export const seedInvoices = [
  { memberIndex: 0, type: 'MEMBERSHIP_FEE', amount: 500, payment_status: 'PAID',   notes: 'Annual membership 2026' },
  { memberIndex: 1, type: 'MEMBERSHIP_FEE', amount: 300, payment_status: 'PAID',   notes: '6-month membership' },
  { memberIndex: 2, type: 'FINE',           amount: 40,  payment_status: 'UNPAID', notes: 'Overdue: Letters Never Sent' },
  { memberIndex: 0, type: 'FINE',           amount: 20,  payment_status: 'UNPAID', notes: 'Overdue: Midnight in Bombay' },
];

export const seedMaintenance = [
  { isbn: '9780000000019', category: 'BOOK_DAMAGE', description: 'Water-damaged spine, front desk copy', cost: 150 },
  { asset_name: 'Reading room printer', category: 'EQUIPMENT', description: 'Toner replacement + service', cost: 1200 },
  { asset_name: 'Aisle C shelving', category: 'FACILITY', description: 'Re-levelled and re-anchored bracket', cost: 800 },
];
