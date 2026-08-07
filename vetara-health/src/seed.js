/* Seed the database with demo data (matches the original prototype). Run: npm run seed */
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

initDb();

// wipe
['reminders','appointments','reviews','medical_records','medications','vaccinations','pets','providers','users']
  .forEach(t => db.prepare(`DELETE FROM ${t}`).run());

const hash = bcrypt.hashSync('demo1234', 10);

const insUser = db.prepare(`INSERT INTO users (email,password_hash,name,role,clinic_name) VALUES (?,?,?,?,?)`);
const sarah = insUser.run('sarah@demo.vetara', hash, 'Sarah Mitchell', 'owner', null).lastInsertRowid;
const elena = insUser.run('elena@demo.vetara', hash, 'Dr. Elena Vasquez', 'provider', 'Riverbend Animal Hospital').lastInsertRowid;

const insProv = db.prepare(`INSERT INTO providers (user_id,name,doctor,type,distance,tags,grade,services,icon,gradient) VALUES (?,?,?,?,?,?,?,?,?,?)`);
const riverbend = insProv.run(elena, 'Riverbend Animal Hospital', 'Dr. Elena Vasquez, DVM', 'Veterinarian', '2.1 mi', 'General practice,Dermatology,Surgery', 'A+', 'Wellness exams · Dermatology · Surgery', 'steth', 'var(--grad)').lastInsertRowid;
const northgate = insProv.run(null, 'Northgate Vet Clinic', 'Dr. James Okafor, DVM', 'Veterinarian', '3.4 mi', 'General practice,Urgent care', 'A', 'Urgent care · General practice', 'steth', 'var(--grad-bp)').lastInsertRowid;
const lakeside = insProv.run(null, 'Lakeside Feline Care', 'Dr. Priya Raman, DVM', 'Veterinarian', '4.0 mi', 'Feline only,Dentistry', 'A', 'Feline-only practice · Dentistry', 'steth', 'var(--grad-bp)').lastInsertRowid;
const westview = insProv.run(null, 'Westview Emergency Animal Hospital', '24/7 Emergency team', 'Emergency', '5.8 mi', 'Emergency,24/7,Specialty surgery', 'A', 'Emergency · Specialty surgery', 'bolt', 'var(--grad-or)').lastInsertRowid;
const happypaws = insProv.run(null, 'Happy Paws Grooming Studio', 'Tessa Nguyen, Master Groomer', 'Groomer', '1.5 mi', 'Grooming,De-shedding,Nail care', 'A', 'Full groom · De-shedding · Nail care', 'heart', 'var(--grad-pp)').lastInsertRowid;
const walkers = insProv.run(null, 'Charlotte Trail Walkers', 'Jake Morrison, Certified Walker', 'Dog Walker', '0.8 mi', 'Solo walks,Group walks,GPS-tracked', 'A', 'Solo & group walks · GPS-tracked routes', 'paw', 'var(--grad-gm)').lastInsertRowid;
const fairview = insProv.run(null, 'Fairview Canine Training', 'Dana Reyes, CPDT-KA', 'Trainer', '2.7 mi', 'Obedience,Puppy classes,Behavior', 'A', 'Obedience · Puppy classes · Behavior consults', 'star', 'var(--grad-bp)').lastInsertRowid;
const cedar = insProv.run(null, 'Cedar Lodge Boarding', 'Boarding & daycare team', 'Boarding', '4.4 mi', 'Boarding,Daycare,Webcam access', 'A', 'Overnight boarding · Daycare · Webcam access', 'pin', 'var(--grad-or)').lastInsertRowid;

const insPet = db.prepare(`INSERT INTO pets (owner_id,name,species,breed,sex,dob,weight_kg,color,microchip,tag_id,conditions,health_score) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const luna = insPet.run(sarah, 'Luna', 'Dog', 'Golden Retriever', 'F (spayed)', '2022-03-12', 29.5, 'var(--grad)', '985 112 004 532 117', 'VET-8841-LX', 'Seasonal allergies', 96).lastInsertRowid;
const milo = insPet.run(sarah, 'Milo', 'Cat', 'Maine Coon', 'M (neutered)', '2024-08-02', 6.8, 'var(--grad-bp)', '985 112 009 871 220', 'VET-9120-MC', '', 91).lastInsertRowid;
const daisy = insPet.run(sarah, 'Daisy', 'Dog', 'Beagle', 'F (spayed)', '2019-05-20', 12.1, 'var(--grad-gm)', '985 112 001 220 489', 'VET-7733-DB', 'Early arthritis,Weight management', 84).lastInsertRowid;

const insVax = db.prepare(`INSERT INTO vaccinations (pet_id,name,given_on,due_on) VALUES (?,?,?,?)`);
insVax.run(luna, 'Rabies (3-yr)', '2024-04-15', '2027-04-15');
insVax.run(luna, 'DHPP', '2025-01-10', '2026-01-10');
insVax.run(luna, 'Bordetella', '2025-09-09', '2026-09-09');
insVax.run(luna, 'Leptospirosis', '2025-01-10', '2026-01-10');
insVax.run(milo, 'Rabies (1-yr)', '2025-08-18', '2026-08-18');
insVax.run(milo, 'FVRCP', '2025-08-18', '2026-08-18');
insVax.run(milo, 'FeLV', '2025-08-18', '2026-08-18');
insVax.run(daisy, 'Rabies (3-yr)', '2025-06-21', '2028-06-21');
insVax.run(daisy, 'DHPP', '2025-06-21', '2026-06-21');
insVax.run(daisy, 'Bordetella', '2024-10-05', '2025-10-05');

const insMed = db.prepare(`INSERT INTO medications (pet_id,name,dose,until_note) VALUES (?,?,?,?)`);
insMed.run(luna, 'Apoquel 16mg', '1 tablet daily', 'Ongoing — allergy season');
insMed.run(luna, 'Simparica Trio', '1 chew monthly', 'Ongoing');
insMed.run(milo, 'Revolution Plus', 'Topical monthly', 'Ongoing');
insMed.run(daisy, 'Carprofen 25mg', '1/2 tablet twice daily', 'Arthritis management');

const insRec = db.prepare(`INSERT INTO medical_records (pet_id,provider_id,type,title,diagnosis,note,visited_on,author_label) VALUES (?,?,?,?,?,?,?,?)`);
insRec.run(luna, riverbend, 'Routine Checkup', 'Dermatology follow-up', 'Allergic dermatitis — resolving', 'Skin irritation resolving well. Continue Apoquel 16mg daily through July. Recheck only if symptoms return.', '2026-05-28', 'Dr. Elena Vasquez · Riverbend Animal Hospital');
insRec.run(luna, riverbend, 'Routine Checkup', 'Annual wellness exam', 'Healthy — BCS 5/9', 'Excellent body condition. Dental tartar grade 1, cleaning recommended within 12 months. CBC/chemistry unremarkable.', '2026-02-14', 'Dr. Elena Vasquez · Riverbend Animal Hospital');
insRec.run(luna, northgate, 'Emergency', 'Acute otitis externa', 'Ear infection — left ear', 'Treated with Osurnia. Resolved at recheck Nov 17. No recurrence.', '2025-11-03', 'Dr. James Okafor · Northgate Vet Clinic');
insRec.run(milo, lakeside, 'Lab Results', 'Senior wellness panel', 'All values in range', 'CBC, chemistry, T4 within normal limits. Mild gingivitis noted on exam — dental diet recommended.', '2026-04-10', 'Dr. Priya Raman · Lakeside Feline Care');
insRec.run(milo, lakeside, 'Vaccination', 'Annual core vaccines', 'Preventive care', 'Rabies, FVRCP, FeLV administered. No adverse reactions.', '2025-08-18', 'Dr. Priya Raman · Lakeside Feline Care');
insRec.run(daisy, null, 'Vaccination', 'DHPP + Rabies boosters', 'Preventive care', 'Core vaccines administered. Record imported automatically from PDF with 99.2% field confidence.', '2025-06-21', 'Banfield Pet Hospital — imported via AI');

const insRev = db.prepare(`INSERT INTO reviews (provider_id,user_id,rating,title,text,recommended) VALUES (?,?,?,?,?,?)`);
insRev.run(riverbend, sarah, 5, 'Solved what two clinics could not', "Dr. Vasquez treated our retriever's skin allergies after two other clinics couldn't figure it out. Clear plan, fair pricing, records synced to the app instantly.", 1);
insRev.run(northgate, sarah, 5, 'Same-day urgent care', 'Saw our dog same-day for an ear infection. The visit summary appeared in the app before we got home.', 1);
insRev.run(lakeside, sarah, 5, 'Cat-only is the way', 'Calm waiting room, staff who understand cats. Dr. Raman is thorough and gentle.', 1);
insRev.run(westview, sarah, 4, 'They saved our dog', 'Late-night emergency — the team pulled his full history through the platform instantly. It mattered.', 1);
insRev.run(happypaws, sarah, 5, 'Reads the vaccine record before booking', 'They verify vaccination status through Vetara automatically. Quick, professional, and my anxious dog loves them.', 1);

const insAppt = db.prepare(`INSERT INTO appointments (pet_id,provider_id,owner_id,reason,scheduled_at,status) VALUES (?,?,?,?,?,?)`);
insAppt.run(luna, riverbend, sarah, 'Dental cleaning', '2026-08-24 09:00', 'confirmed');
insAppt.run(daisy, northgate, sarah, 'Arthritis recheck + weight check', '2026-09-02 14:30', 'confirmed');

const insRem = db.prepare(`INSERT INTO reminders (pet_id,owner_id,what,due_note,level) VALUES (?,?,?,?,?)`);
insRem.run(luna, sarah, 'DHPP + Lepto boosters due', 'Jan 2026 — overdue', 'red');
insRem.run(luna, sarah, 'Dental cleaning recommended', 'Before Feb 2027', 'amber');
insRem.run(milo, sarah, 'Annual vaccines due', 'Aug 2026 — this month', 'amber');
insRem.run(daisy, sarah, 'Bordetella booster overdue', 'Oct 2025 — overdue', 'red');

console.log('Seed complete.');
console.log('Demo accounts (password: demo1234)');
console.log('  Owner:    sarah@demo.vetara');
console.log('  Provider: elena@demo.vetara');
