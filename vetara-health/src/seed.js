/* Seed the database with demo data (matches the original prototype). Run: npm run seed */
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

initDb();

// wipe
['open_slots','posts','insurance_claims','insurance_policies','reminders','appointments','reviews','medical_records','medications','vaccinations','pets','providers','users']
  .forEach(t => db.prepare(`DELETE FROM ${t}`).run());

const hash = bcrypt.hashSync('demo1234', 10);

const insUser = db.prepare(`INSERT INTO users (email,password_hash,name,role,clinic_name) VALUES (?,?,?,?,?)`);
const sarah = insUser.run('sarah@demo.vetara', hash, 'Sarah Mitchell', 'owner', null).lastInsertRowid;
const elena = insUser.run('elena@demo.vetara', hash, 'Dr. Elena Vasquez', 'provider', 'Riverbend Animal Hospital').lastInsertRowid;

const insProv = db.prepare(`INSERT INTO providers (user_id,name,doctor,type,distance,tags,grade,grade_word,services,icon,gradient,metrics,rec_rate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const m = o => JSON.stringify(o);
const riverbend = insProv.run(elena, 'Riverbend Animal Hospital', 'Dr. Elena Vasquez, DVM', 'Veterinarian', '2.1 mi', 'General practice,Dermatology,Surgery', 'A+', 'Exceptional', 'Wellness exams · Dermatology · Surgery', 'steth', 'var(--grad)', m({safety:98,exp:97,clinical:96,comm:95,time:91}), 98).lastInsertRowid;
const northgate = insProv.run(null, 'Northgate Vet Clinic', 'Dr. James Okafor, DVM', 'Veterinarian', '3.4 mi', 'General practice,Urgent care', 'A', 'Excellent', 'Urgent care · General practice', 'steth', 'var(--grad-bp)', m({safety:94,exp:93,clinical:92,comm:96,time:88}), 94).lastInsertRowid;
const lakeside = insProv.run(null, 'Lakeside Feline Care', 'Dr. Priya Raman, DVM', 'Veterinarian', '4.0 mi', 'Feline only,Dentistry', 'A', 'Excellent', 'Feline-only practice · Dentistry', 'steth', 'var(--grad-bp)', m({safety:96,exp:95,clinical:94,comm:93,time:90}), 96).lastInsertRowid;
const westview = insProv.run(null, 'Westview Emergency Animal Hospital', '24/7 Emergency team', 'Emergency', '5.8 mi', 'Emergency,24/7,Specialty surgery', 'A', 'Excellent', 'Emergency · Specialty surgery', 'bolt', 'var(--grad-or)', m({safety:95,exp:88,clinical:93,comm:86,time:97}), 91).lastInsertRowid;
const happypaws = insProv.run(null, 'Happy Paws Grooming Studio', 'Tessa Nguyen, Master Groomer', 'Groomer', '1.5 mi', 'Grooming,De-shedding,Nail care', 'A', 'Excellent', 'Full groom · De-shedding · Nail care', 'heart', 'var(--grad-pp)', m({safety:97,exp:96,clinical:90,comm:94,time:93}), 97).lastInsertRowid;
const walkers = insProv.run(null, 'Charlotte Trail Walkers', 'Jake Morrison, Certified Walker', 'Dog Walker', '0.8 mi', 'Solo walks,Group walks,GPS-tracked', 'A', 'Excellent', 'Solo & group walks · GPS-tracked routes', 'paw', 'var(--grad-gm)', m({safety:96,exp:97,clinical:88,comm:95,time:94}), 95).lastInsertRowid;
const fairview = insProv.run(null, 'Fairview Canine Training', 'Dana Reyes, CPDT-KA', 'Trainer', '2.7 mi', 'Obedience,Puppy classes,Behavior', 'A', 'Excellent', 'Obedience · Puppy classes · Behavior consults', 'star', 'var(--grad-bp)', m({safety:95,exp:94,clinical:89,comm:96,time:92}), 93).lastInsertRowid;
const cedar = insProv.run(null, 'Cedar Lodge Boarding', 'Boarding & daycare team', 'Boarding', '4.4 mi', 'Boarding,Daycare,Webcam access', 'A', 'Excellent', 'Overnight boarding · Daycare · Webcam access', 'pin', 'var(--grad-or)', m({safety:94,exp:91,clinical:87,comm:90,time:95}), 90).lastInsertRowid;

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

const insPol = db.prepare(`INSERT INTO insurance_policies (pet_id,carrier,premium,coverage,discount,saved_note) VALUES (?,?,?,?,?,?)`);
insPol.run(luna, 'PetSure Complete', '$62/mo', 'Accident + illness + wellness', 25, '$186 saved this year');
insPol.run(milo, 'PetSure Essential', '$28/mo', 'Accident + illness', 20, '$72 saved this year');
insPol.run(daisy, 'PetSure Complete', '$54/mo', 'Accident + illness + wellness', 15, '$97 saved this year');

const insClaim = db.prepare(`INSERT INTO insurance_claims (pet_id,what,amount,status,claimed_on) VALUES (?,?,?,?,?)`);
insClaim.run(luna, 'Dermatology visit + Apoquel', '$214', 'Reimbursed', '2026-06-02');
insClaim.run(daisy, 'Arthritis consult + X-rays', '$386', 'Processing', '2026-05-30');
insClaim.run(milo, 'Wellness panel', '$148', 'Reimbursed', '2026-04-14');

const insUser2 = db.prepare(`INSERT INTO users (email,password_hash,name,role,clinic_name) VALUES (?,?,?,?,?)`);
const mark = insUser2.run('mark@demo.vetara', hash, 'Mark C.', 'owner', null).lastInsertRowid;
const tina = insUser2.run('tina@demo.vetara', hash, 'Tina L.', 'owner', null).lastInsertRowid;
const anne = insUser2.run('anne@demo.vetara', hash, 'Anne F.', 'owner', null).lastInsertRowid;

const insPost = db.prepare(`INSERT INTO posts (user_id,text,image_style,image_caption,likes,comments,sponsored) VALUES (?,?,?,?,?,?,?)`);
insPost.run(mark, 'Bailey passed her advanced obedience certification today. Six months of work — proud of this girl.', 'linear-gradient(135deg,#1d3a32,#2a5446)', 'Fairview Training Center', 48, 12, 0);
insPost.run(tina, 'Vet confirmed the seasonal pollen spike is hitting long-haired breeds hard this month. Daily brushing + paw wipes after balcony time has helped Coco a lot.', null, null, 96, 31, 0);
insPost.run(anne, 'Scout was reunited with us within 40 minutes of slipping his leash — a neighbor scanned his Vetara QR tag and got our emergency contact instantly. Worth the subscription alone.', 'linear-gradient(135deg,#3a2d1d,#54422a)', 'Home safe', 342, 57, 0);
insPost.run(elena, 'Riverbend now accepts Vetara digital vaccine records at check-in — no more paper printouts. Book summer visits with verified records in one tap.', null, null, 210, 18, 1);

const insSlot = db.prepare(`INSERT INTO open_slots (provider_id,service,slot_at,cause,radius,reached,incentive,status,claimed_by) VALUES (?,?,?,?,?,?,?,?,?)`);
insSlot.run(riverbend, 'Wellness exam', '2026-08-08 11:00', 'Cancellation', 15, 864, '15% off', 'open', null);
insSlot.run(happypaws, 'Full groom', '2026-08-08 15:30', 'Cancellation', 10, 412, '10% off', 'open', null);
insSlot.run(walkers, 'Group walk — 1 spot', '2026-08-09 09:00', 'Spot opened', 5, 118, null, 'open', null);
insSlot.run(riverbend, 'Dental consult', '2026-06-05 14:00', 'Cancellation', 30, 2289, null, 'claimed', 'Marcus T. & Bella');
insSlot.run(riverbend, 'Vaccination visit', '2026-06-02 09:45', 'Cancellation', 10, 412, null, 'expired', null);

// demo verification share links (no-login pages at /r/<token>)
const weekOut = new Date(Date.now() + 7 * 864e5).toISOString();
const insShare = db.prepare(`INSERT INTO share_links (pet_id,token,purpose,expires_at) VALUES (?,?,?,?)`);
insShare.run(luna, 'demoLuna8x2k', 'Grooming', weekOut);
insShare.run(daisy, 'demoDaisyQm9p', 'Grooming', weekOut);
db.prepare(`INSERT INTO share_access_log (share_id,action,note) VALUES (1,'viewed','Happy Paws Grooming Studio')`).run();
db.prepare(`INSERT INTO share_access_log (share_id,action,note) VALUES (1,'confirmed','Happy Paws Grooming Studio')`).run();

console.log('Seed complete.');
console.log('Demo accounts (password: demo1234)');
console.log('  Owner:    sarah@demo.vetara');
console.log('  Provider: elena@demo.vetara');
console.log('Demo verification links (no login needed):');
console.log('  /r/demoLuna8x2k   (Luna — cleared/warning state)');
console.log('  /r/demoDaisyQm9p  (Daisy — blocked state, expired Bordetella)');
