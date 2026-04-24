require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Pet, HealthRecord, BehaviorLog, NutritionPlan, Vaccination,
  Medication, Appointment, WeightLog, Activity, Symptom, EmergencyContact, Insurance, Grooming, HealthReport } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // Create demo user
    const password = await bcrypt.hash('password123', 10);
    const user = await User.create({ email: 'demo@petmonitor.com', password, name: 'Demo User', plan: 'premium' });
    console.log('User created');

    // Create 15 Pets
    const petsData = [
      { userId: user.id, name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 5, weight: 72, gender: 'Male', color: 'Golden', microchipId: 'MC-001-GR', notes: 'Very friendly, loves fetch' },
      { userId: user.id, name: 'Luna', species: 'Cat', breed: 'Siamese', age: 3, weight: 9, gender: 'Female', color: 'Cream/Brown', microchipId: 'MC-002-SI', notes: 'Indoor cat, vocal' },
      { userId: user.id, name: 'Max', species: 'Dog', breed: 'German Shepherd', age: 4, weight: 85, gender: 'Male', color: 'Black/Tan', microchipId: 'MC-003-GS', notes: 'Guard dog, well trained' },
      { userId: user.id, name: 'Bella', species: 'Dog', breed: 'French Bulldog', age: 2, weight: 24, gender: 'Female', color: 'Fawn', microchipId: 'MC-004-FB', notes: 'Playful, snores loudly' },
      { userId: user.id, name: 'Whiskers', species: 'Cat', breed: 'Maine Coon', age: 6, weight: 18, gender: 'Male', color: 'Tabby', microchipId: 'MC-005-MC', notes: 'Largest domestic cat breed' },
      { userId: user.id, name: 'Daisy', species: 'Dog', breed: 'Labrador Retriever', age: 7, weight: 65, gender: 'Female', color: 'Chocolate', microchipId: 'MC-006-LR', notes: 'Loves swimming' },
      { userId: user.id, name: 'Milo', species: 'Cat', breed: 'British Shorthair', age: 4, weight: 12, gender: 'Male', color: 'Grey', microchipId: 'MC-007-BS', notes: 'Calm and easygoing' },
      { userId: user.id, name: 'Rocky', species: 'Dog', breed: 'Boxer', age: 3, weight: 60, gender: 'Male', color: 'Brindle', microchipId: 'MC-008-BX', notes: 'High energy, loves running' },
      { userId: user.id, name: 'Cleo', species: 'Cat', breed: 'Persian', age: 5, weight: 10, gender: 'Female', color: 'White', microchipId: 'MC-009-PR', notes: 'Needs daily grooming' },
      { userId: user.id, name: 'Charlie', species: 'Dog', breed: 'Beagle', age: 6, weight: 28, gender: 'Male', color: 'Tricolor', microchipId: 'MC-010-BG', notes: 'Scent hound, food motivated' },
      { userId: user.id, name: 'Nemo', species: 'Fish', breed: 'Clownfish', age: 2, weight: 0.1, gender: 'Male', color: 'Orange/White', microchipId: null, notes: 'Saltwater tank' },
      { userId: user.id, name: 'Thumper', species: 'Rabbit', breed: 'Holland Lop', age: 3, weight: 4, gender: 'Male', color: 'Brown', microchipId: 'MC-012-HL', notes: 'Free roam rabbit' },
      { userId: user.id, name: 'Polly', species: 'Bird', breed: 'African Grey Parrot', age: 10, weight: 0.9, gender: 'Female', color: 'Grey/Red', microchipId: null, notes: 'Can speak 50+ words' },
      { userId: user.id, name: 'Ziggy', species: 'Dog', breed: 'Dachshund', age: 8, weight: 18, gender: 'Male', color: 'Red', microchipId: 'MC-014-DC', notes: 'Back issues, needs ramp' },
      { userId: user.id, name: 'Shadow', species: 'Cat', breed: 'Russian Blue', age: 2, weight: 11, gender: 'Female', color: 'Blue-Grey', microchipId: 'MC-015-RB', notes: 'Shy but affectionate' }
    ];
    const pets = await Pet.bulkCreate(petsData);
    console.log('15 Pets created');

    // Health Records (15+)
    const healthRecordsData = [
      { petId: 1, type: 'Checkup', description: 'Annual wellness exam', date: '2025-12-15', vetName: 'Dr. Smith', diagnosis: 'Healthy', treatment: 'None needed', cost: 150, notes: 'All vitals normal' },
      { petId: 1, type: 'Dental', description: 'Dental cleaning', date: '2025-11-20', vetName: 'Dr. Smith', diagnosis: 'Mild tartar buildup', treatment: 'Professional cleaning', cost: 350, notes: 'Recommend dental chews' },
      { petId: 2, type: 'Illness', description: 'Upper respiratory infection', date: '2025-10-05', vetName: 'Dr. Johnson', diagnosis: 'URI', treatment: 'Antibiotics 10 days', cost: 200, followUp: '2025-10-19', notes: 'Keep isolated from other cats' },
      { petId: 3, type: 'Injury', description: 'Paw pad laceration', date: '2025-09-12', vetName: 'Dr. Williams', diagnosis: 'Cut on right front paw', treatment: 'Cleaned, bandaged, antibiotics', cost: 275, followUp: '2025-09-19', notes: 'Limit activity for 2 weeks' },
      { petId: 4, type: 'Surgery', description: 'Spay surgery', date: '2025-08-01', vetName: 'Dr. Johnson', diagnosis: 'Elective spay', treatment: 'Ovariohysterectomy', cost: 500, followUp: '2025-08-15', notes: 'E-collar for 10 days' },
      { petId: 5, type: 'Checkup', description: 'Senior wellness panel', date: '2025-07-22', vetName: 'Dr. Smith', diagnosis: 'Early kidney changes', treatment: 'Kidney diet recommended', cost: 300, followUp: '2026-01-22', notes: 'Recheck bloodwork in 6 months' },
      { petId: 6, type: 'Allergy', description: 'Skin allergy testing', date: '2025-06-15', vetName: 'Dr. Williams', diagnosis: 'Environmental allergies', treatment: 'Apoquel prescribed', cost: 450, notes: 'Allergic to grass and dust mites' },
      { petId: 7, type: 'Checkup', description: 'Annual exam with bloodwork', date: '2025-11-01', vetName: 'Dr. Johnson', diagnosis: 'Healthy', treatment: 'None', cost: 200, notes: 'All bloodwork normal' },
      { petId: 8, type: 'Injury', description: 'Torn ACL', date: '2025-05-10', vetName: 'Dr. Williams', diagnosis: 'Partial ACL tear left knee', treatment: 'TPLO surgery scheduled', cost: 3500, followUp: '2025-06-10', notes: 'Restrict activity immediately' },
      { petId: 9, type: 'Eye', description: 'Eye discharge evaluation', date: '2025-10-20', vetName: 'Dr. Smith', diagnosis: 'Mild conjunctivitis', treatment: 'Eye drops 2x daily', cost: 175, followUp: '2025-11-03', notes: 'Common in flat-faced breeds' },
      { petId: 10, type: 'Dental', description: 'Tooth extraction', date: '2025-04-18', vetName: 'Dr. Johnson', diagnosis: 'Fractured premolar', treatment: 'Extraction under anesthesia', cost: 600, notes: 'Soft food for 5 days' },
      { petId: 11, type: 'Checkup', description: 'Water quality check', date: '2025-09-01', vetName: 'Dr. Aquatic', diagnosis: 'Healthy', treatment: 'Adjust pH levels', cost: 50, notes: 'Tank parameters slightly off' },
      { petId: 12, type: 'Checkup', description: 'Rabbit wellness exam', date: '2025-08-20', vetName: 'Dr. Exotic', diagnosis: 'Healthy', treatment: 'Teeth trimmed', cost: 125, notes: 'Good dental health' },
      { petId: 13, type: 'Checkup', description: 'Avian wellness exam', date: '2025-07-10', vetName: 'Dr. Exotic', diagnosis: 'Healthy', treatment: 'Wing clip', cost: 100, notes: 'Feather condition excellent' },
      { petId: 14, type: 'Chronic', description: 'Back pain evaluation', date: '2025-11-15', vetName: 'Dr. Williams', diagnosis: 'IVDD Stage 2', treatment: 'Anti-inflammatory, rest, supplements', cost: 400, followUp: '2025-12-15', notes: 'No jumping allowed' },
      { petId: 15, type: 'Checkup', description: 'Kitten checkup', date: '2025-12-01', vetName: 'Dr. Johnson', diagnosis: 'Healthy kitten', treatment: 'Deworming', cost: 100, notes: 'Growing well' }
    ];
    await HealthRecord.bulkCreate(healthRecordsData);
    console.log('16 Health Records created');

    // Behavior Logs (15+)
    const behaviorData = [
      { petId: 1, behavior: 'Excessive barking at mailman', category: 'Aggression', severity: 'medium', date: '2025-12-10', time: '10:30 AM', duration: '15 min', triggers: 'Doorbell, strangers', notes: 'Gets worse in afternoon' },
      { petId: 1, behavior: 'Tail chasing', category: 'Compulsive', severity: 'low', date: '2025-12-08', time: '3:00 PM', duration: '5 min', triggers: 'Boredom', notes: 'Usually after being alone' },
      { petId: 2, behavior: 'Nocturnal yowling', category: 'Vocalization', severity: 'medium', date: '2025-12-12', time: '2:00 AM', duration: '30 min', triggers: 'Night time', notes: 'Wakes up household' },
      { petId: 3, behavior: 'Leash reactivity', category: 'Aggression', severity: 'high', date: '2025-12-05', time: '8:00 AM', duration: '10 min', triggers: 'Other dogs on walks', notes: 'Lunges and barks' },
      { petId: 4, behavior: 'Separation anxiety', category: 'Anxiety', severity: 'high', date: '2025-12-09', time: '9:00 AM', duration: '2 hours', triggers: 'Owner leaving', notes: 'Destroys furniture' },
      { petId: 5, behavior: 'Excessive grooming', category: 'Compulsive', severity: 'medium', date: '2025-12-11', time: '4:00 PM', duration: '45 min', triggers: 'Stress', notes: 'Hair loss on belly' },
      { petId: 6, behavior: 'Counter surfing', category: 'Training', severity: 'low', date: '2025-12-07', time: '6:00 PM', duration: '5 min', triggers: 'Food on counter', notes: 'Stole a sandwich' },
      { petId: 7, behavior: 'Hiding under bed', category: 'Anxiety', severity: 'low', date: '2025-12-06', time: '7:00 PM', duration: '1 hour', triggers: 'Visitors', notes: 'Normal for this cat' },
      { petId: 8, behavior: 'Jumping on people', category: 'Training', severity: 'medium', date: '2025-12-04', time: '5:30 PM', duration: '10 min', triggers: 'Excitement', notes: 'Needs more training' },
      { petId: 9, behavior: 'Scratching furniture', category: 'Destructive', severity: 'medium', date: '2025-12-03', time: '11:00 AM', duration: '20 min', triggers: 'Boredom', notes: 'Need more scratching posts' },
      { petId: 10, behavior: 'Food guarding', category: 'Aggression', severity: 'high', date: '2025-12-02', time: '6:30 PM', duration: '5 min', triggers: 'Other pets near food', notes: 'Growls during meals' },
      { petId: 12, behavior: 'Thumping', category: 'Communication', severity: 'low', date: '2025-12-01', time: '8:00 PM', duration: '10 min', triggers: 'Loud noises', notes: 'Normal rabbit behavior' },
      { petId: 13, behavior: 'Feather plucking', category: 'Compulsive', severity: 'high', date: '2025-11-30', time: '2:00 PM', duration: '1 hour', triggers: 'Boredom, lack of stimulation', notes: 'Needs more toys and attention' },
      { petId: 14, behavior: 'Whining at stairs', category: 'Pain', severity: 'medium', date: '2025-12-13', time: '7:00 AM', duration: '5 min', triggers: 'Stairs', notes: 'May be back pain related' },
      { petId: 15, behavior: 'Kneading blankets', category: 'Comfort', severity: 'low', date: '2025-12-14', time: '9:00 PM', duration: '15 min', triggers: 'Relaxation', notes: 'Happy behavior' }
    ];
    await BehaviorLog.bulkCreate(behaviorData);
    console.log('15 Behavior Logs created');

    // Nutrition Plans (15+)
    const nutritionData = [
      { petId: 1, foodName: 'Royal Canin Golden Retriever', brand: 'Royal Canin', type: 'Dry Kibble', servingSize: '2.5 cups', frequency: '2x daily', calories: 380, protein: 28, fat: 18, fiber: 3.5, specialDiet: null, notes: 'Breed-specific formula' },
      { petId: 1, foodName: 'Wellness CORE Grain-Free', brand: 'Wellness', type: 'Wet Food', servingSize: '1 can', frequency: 'Dinner topper', calories: 450, protein: 34, fat: 14, fiber: 4, specialDiet: 'Grain-free', notes: 'Mix with kibble' },
      { petId: 2, foodName: 'Blue Buffalo Indoor Cat', brand: 'Blue Buffalo', type: 'Dry Kibble', servingSize: '1/3 cup', frequency: '2x daily', calories: 370, protein: 32, fat: 15, fiber: 7, specialDiet: 'Indoor formula', notes: 'Helps with hairballs' },
      { petId: 3, foodName: 'Purina Pro Plan Large Breed', brand: 'Purina', type: 'Dry Kibble', servingSize: '3 cups', frequency: '2x daily', calories: 398, protein: 26, fat: 16, fiber: 3, specialDiet: null, notes: 'Joint support formula' },
      { petId: 4, foodName: 'Hill\'s Science Diet Small Breed', brand: 'Hill\'s', type: 'Dry Kibble', servingSize: '1 cup', frequency: '2x daily', calories: 373, protein: 24, fat: 16.5, fiber: 2.7, specialDiet: null, notes: 'Small kibble size' },
      { petId: 5, foodName: 'Royal Canin Renal Support', brand: 'Royal Canin', type: 'Wet Food', servingSize: '1 can', frequency: '2x daily', calories: 200, protein: 22, fat: 12, fiber: 2, specialDiet: 'Kidney diet', notes: 'Low phosphorus' },
      { petId: 6, foodName: 'Nutro Natural Choice', brand: 'Nutro', type: 'Dry Kibble', servingSize: '2 cups', frequency: '2x daily', calories: 340, protein: 23, fat: 13, fiber: 4, specialDiet: 'Limited ingredient', notes: 'For sensitive skin' },
      { petId: 7, foodName: 'Purina ONE Indoor Cat', brand: 'Purina', type: 'Dry Kibble', servingSize: '1/2 cup', frequency: '2x daily', calories: 380, protein: 34, fat: 14, fiber: 3, specialDiet: 'Indoor', notes: 'Weight management' },
      { petId: 8, foodName: 'Orijen Original', brand: 'Orijen', type: 'Dry Kibble', servingSize: '2 cups', frequency: '2x daily', calories: 449, protein: 38, fat: 18, fiber: 5, specialDiet: 'High protein', notes: 'Biologically appropriate' },
      { petId: 9, foodName: 'Royal Canin Persian', brand: 'Royal Canin', type: 'Dry Kibble', servingSize: '1/3 cup', frequency: '2x daily', calories: 407, protein: 30, fat: 22, fiber: 4.5, specialDiet: 'Breed-specific', notes: 'Almond-shaped kibble for flat face' },
      { petId: 10, foodName: 'Merrick Grain Free', brand: 'Merrick', type: 'Wet Food', servingSize: '1 can', frequency: '2x daily', calories: 380, protein: 32, fat: 15, fiber: 3.5, specialDiet: 'Grain-free', notes: 'Real deboned meat' },
      { petId: 11, foodName: 'Tetra Marine Flakes', brand: 'Tetra', type: 'Fish Flakes', servingSize: 'Pinch', frequency: '2x daily', calories: 5, protein: 45, fat: 7, fiber: 2, specialDiet: 'Marine', notes: 'Supplement with frozen brine shrimp' },
      { petId: 12, foodName: 'Oxbow Essentials Timothy Hay', brand: 'Oxbow', type: 'Hay', servingSize: 'Unlimited', frequency: 'Always available', calories: 180, protein: 10, fat: 2, fiber: 32, specialDiet: 'Rabbit essential', notes: '80% of diet should be hay' },
      { petId: 13, foodName: 'Harrison\'s Adult Lifetime Fine', brand: 'Harrison\'s', type: 'Pellets', servingSize: '2 tbsp', frequency: '1x daily', calories: 350, protein: 18, fat: 14, fiber: 4, specialDiet: 'Organic bird', notes: 'Supplement with fresh fruits/veggies' },
      { petId: 14, foodName: 'Hill\'s Science Diet Small Paws', brand: 'Hill\'s', type: 'Dry Kibble', servingSize: '3/4 cup', frequency: '2x daily', calories: 365, protein: 23, fat: 15.5, fiber: 2.5, specialDiet: 'Joint support', notes: 'Glucosamine added' },
      { petId: 15, foodName: 'Fancy Feast Kitten', brand: 'Fancy Feast', type: 'Wet Food', servingSize: '1 can', frequency: '3x daily', calories: 95, protein: 11, fat: 2, fiber: 1.5, specialDiet: 'Kitten', notes: 'High calorie for growth' }
    ];
    await NutritionPlan.bulkCreate(nutritionData);
    console.log('16 Nutrition Plans created');

    // Vaccinations (15+)
    const vaccinationData = [
      { petId: 1, vaccineName: 'Rabies', dateAdministered: '2025-06-15', nextDueDate: '2026-06-15', vetName: 'Dr. Smith', batchNumber: 'RAB-2025-001', manufacturer: 'Merial', cost: 25, notes: '3-year vaccine' },
      { petId: 1, vaccineName: 'DHPP', dateAdministered: '2025-06-15', nextDueDate: '2026-06-15', vetName: 'Dr. Smith', batchNumber: 'DHPP-2025-001', manufacturer: 'Zoetis', cost: 35, notes: 'Distemper combo' },
      { petId: 2, vaccineName: 'FVRCP', dateAdministered: '2025-05-10', nextDueDate: '2026-05-10', vetName: 'Dr. Johnson', batchNumber: 'FVR-2025-001', manufacturer: 'Boehringer', cost: 30, notes: 'Feline distemper combo' },
      { petId: 2, vaccineName: 'Rabies', dateAdministered: '2025-05-10', nextDueDate: '2026-05-10', vetName: 'Dr. Johnson', batchNumber: 'RAB-2025-002', manufacturer: 'Merial', cost: 25, notes: 'Required by law' },
      { petId: 3, vaccineName: 'Bordetella', dateAdministered: '2025-08-01', nextDueDate: '2026-02-01', vetName: 'Dr. Williams', batchNumber: 'BOR-2025-001', manufacturer: 'Zoetis', cost: 30, notes: 'Kennel cough prevention' },
      { petId: 3, vaccineName: 'Rabies', dateAdministered: '2025-04-20', nextDueDate: '2028-04-20', vetName: 'Dr. Williams', batchNumber: 'RAB-2025-003', manufacturer: 'Merial', cost: 25, notes: '3-year rabies' },
      { petId: 4, vaccineName: 'DHPP', dateAdministered: '2025-07-15', nextDueDate: '2026-07-15', vetName: 'Dr. Johnson', batchNumber: 'DHPP-2025-002', manufacturer: 'Zoetis', cost: 35, notes: 'Annual booster' },
      { petId: 5, vaccineName: 'FVRCP', dateAdministered: '2025-03-22', nextDueDate: '2026-03-22', vetName: 'Dr. Smith', batchNumber: 'FVR-2025-002', manufacturer: 'Boehringer', cost: 30, notes: 'Senior cat, monitored closely' },
      { petId: 6, vaccineName: 'Leptospirosis', dateAdministered: '2025-06-01', nextDueDate: '2026-06-01', vetName: 'Dr. Williams', batchNumber: 'LEP-2025-001', manufacturer: 'Nobivac', cost: 30, notes: 'Important for water dogs' },
      { petId: 7, vaccineName: 'FeLV', dateAdministered: '2025-09-15', nextDueDate: '2026-09-15', vetName: 'Dr. Johnson', batchNumber: 'FELV-2025-001', manufacturer: 'Merial', cost: 35, notes: 'Feline leukemia' },
      { petId: 8, vaccineName: 'Canine Influenza', dateAdministered: '2025-10-01', nextDueDate: '2026-10-01', vetName: 'Dr. Williams', batchNumber: 'CIV-2025-001', manufacturer: 'Zoetis', cost: 40, notes: 'H3N2 and H3N8' },
      { petId: 10, vaccineName: 'Lyme Disease', dateAdministered: '2025-03-15', nextDueDate: '2026-03-15', vetName: 'Dr. Smith', batchNumber: 'LYM-2025-001', manufacturer: 'Zoetis', cost: 35, notes: 'Tick prevention area' },
      { petId: 12, vaccineName: 'RHDV2', dateAdministered: '2025-05-20', nextDueDate: '2026-05-20', vetName: 'Dr. Exotic', batchNumber: 'RHD-2025-001', manufacturer: 'Filavac', cost: 45, notes: 'Rabbit hemorrhagic disease' },
      { petId: 14, vaccineName: 'DHPP', dateAdministered: '2025-09-01', nextDueDate: '2026-09-01', vetName: 'Dr. Smith', batchNumber: 'DHPP-2025-003', manufacturer: 'Zoetis', cost: 35, notes: 'Senior dog, watched for reactions' },
      { petId: 15, vaccineName: 'FVRCP', dateAdministered: '2025-11-15', nextDueDate: '2026-02-15', vetName: 'Dr. Johnson', batchNumber: 'FVR-2025-003', manufacturer: 'Boehringer', cost: 30, notes: 'Kitten series #2 of 3' }
    ];
    await Vaccination.bulkCreate(vaccinationData);
    console.log('15 Vaccinations created');

    // Medications (15+)
    const medicationData = [
      { petId: 1, name: 'Heartgard Plus', dosage: '68mcg', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31', prescribedBy: 'Dr. Smith', reason: 'Heartworm prevention', cost: 15, refillDate: '2026-01-01', notes: 'Give with food' },
      { petId: 1, name: 'NexGard', dosage: '68mg', frequency: 'Monthly', startDate: '2025-01-01', endDate: '2025-12-31', prescribedBy: 'Dr. Smith', reason: 'Flea and tick prevention', cost: 20, refillDate: '2026-01-01', notes: 'Beef-flavored chew' },
      { petId: 2, name: 'Revolution Plus', dosage: '0.5ml', frequency: 'Monthly', startDate: '2025-01-01', prescribedBy: 'Dr. Johnson', reason: 'Parasite prevention', cost: 22, notes: 'Topical application' },
      { petId: 3, name: 'Cosequin DS', dosage: '1 tablet', frequency: 'Daily', startDate: '2025-06-01', prescribedBy: 'Dr. Williams', reason: 'Joint support', cost: 30, notes: 'Glucosamine supplement' },
      { petId: 4, name: 'Bravecto', dosage: '250mg', frequency: 'Every 3 months', startDate: '2025-03-01', prescribedBy: 'Dr. Johnson', reason: 'Flea and tick', cost: 55, notes: 'Chewable tablet' },
      { petId: 5, name: 'Azodyl', dosage: '1 capsule', frequency: 'Daily', startDate: '2025-08-01', prescribedBy: 'Dr. Smith', reason: 'Kidney support', cost: 40, notes: 'Probiotic for renal function' },
      { petId: 6, name: 'Apoquel', dosage: '16mg', frequency: 'Daily', startDate: '2025-06-15', prescribedBy: 'Dr. Williams', reason: 'Allergies', cost: 75, notes: 'Anti-itch medication' },
      { petId: 7, name: 'Feliway Diffuser', dosage: 'N/A', frequency: 'Continuous', startDate: '2025-05-01', prescribedBy: 'Dr. Johnson', reason: 'Anxiety reduction', cost: 25, notes: 'Pheromone therapy' },
      { petId: 8, name: 'Rimadyl', dosage: '75mg', frequency: '2x daily', startDate: '2025-05-10', endDate: '2025-06-10', prescribedBy: 'Dr. Williams', reason: 'Post-surgery pain', cost: 45, notes: 'NSAID - give with food' },
      { petId: 9, name: 'Terramycin Eye Ointment', dosage: 'Small strip', frequency: '2x daily', startDate: '2025-10-20', endDate: '2025-11-03', prescribedBy: 'Dr. Smith', reason: 'Conjunctivitis', cost: 15, notes: 'Apply to lower eyelid' },
      { petId: 10, name: 'Cerenia', dosage: '16mg', frequency: 'As needed', startDate: '2025-04-18', endDate: '2025-04-23', prescribedBy: 'Dr. Johnson', reason: 'Post-dental nausea', cost: 30, notes: 'Anti-nausea for anesthesia recovery' },
      { petId: 12, name: 'Oxbow Vitamin C', dosage: '1 tablet', frequency: 'Daily', startDate: '2025-01-01', prescribedBy: 'Dr. Exotic', reason: 'Vitamin supplement', cost: 10, notes: 'Essential nutrient' },
      { petId: 13, name: 'AviCalm', dosage: '1/4 tsp', frequency: 'Daily', startDate: '2025-12-01', prescribedBy: 'Dr. Exotic', reason: 'Feather plucking anxiety', cost: 15, notes: 'Mix in food' },
      { petId: 14, name: 'Gabapentin', dosage: '100mg', frequency: '2x daily', startDate: '2025-11-15', prescribedBy: 'Dr. Williams', reason: 'Back pain (IVDD)', cost: 20, notes: 'Nerve pain management' },
      { petId: 14, name: 'Dasuquin', dosage: '1 soft chew', frequency: 'Daily', startDate: '2025-11-15', prescribedBy: 'Dr. Williams', reason: 'Joint support', cost: 35, notes: 'With MSM for extra support' }
    ];
    await Medication.bulkCreate(medicationData);
    console.log('15 Medications created');

    // Appointments (15+)
    const appointmentData = [
      { petId: 1, vetName: 'Dr. Smith', clinicName: 'Happy Paws Veterinary', date: '2026-01-15', time: '10:00 AM', reason: 'Annual checkup', status: 'scheduled', cost: 150, notes: 'Fasting bloodwork' },
      { petId: 2, vetName: 'Dr. Johnson', clinicName: 'City Cat Clinic', date: '2026-01-20', time: '2:00 PM', reason: 'Follow-up URI', status: 'scheduled', notes: 'Recheck respiratory' },
      { petId: 3, vetName: 'Dr. Williams', clinicName: 'K9 Health Center', date: '2026-02-01', time: '9:00 AM', reason: 'Paw recheck', status: 'scheduled', notes: 'Should be healed' },
      { petId: 4, vetName: 'Dr. Johnson', clinicName: 'Happy Paws Veterinary', date: '2025-12-20', time: '11:00 AM', reason: 'Vaccination booster', status: 'completed', cost: 35, notes: 'Went smoothly' },
      { petId: 5, vetName: 'Dr. Smith', clinicName: 'Happy Paws Veterinary', date: '2026-01-22', time: '3:00 PM', reason: 'Kidney recheck bloodwork', status: 'scheduled', cost: 200, notes: '6 month follow up' },
      { petId: 6, vetName: 'Dr. Williams', clinicName: 'K9 Health Center', date: '2026-03-15', time: '10:30 AM', reason: 'Allergy reassessment', status: 'scheduled', notes: 'Evaluate Apoquel efficacy' },
      { petId: 7, vetName: 'Dr. Johnson', clinicName: 'City Cat Clinic', date: '2025-11-01', time: '1:00 PM', reason: 'Annual exam', status: 'completed', cost: 200, notes: 'All good' },
      { petId: 8, vetName: 'Dr. Williams', clinicName: 'K9 Health Center', date: '2026-02-10', time: '8:30 AM', reason: 'ACL surgery follow-up', status: 'scheduled', cost: 100, notes: 'Physical therapy evaluation' },
      { petId: 9, vetName: 'Dr. Smith', clinicName: 'Happy Paws Veterinary', date: '2026-01-10', time: '4:00 PM', reason: 'Eye recheck', status: 'scheduled', notes: 'Conjunctivitis follow-up' },
      { petId: 10, vetName: 'Dr. Johnson', clinicName: 'Happy Paws Veterinary', date: '2026-04-18', time: '2:30 PM', reason: 'Dental recheck', status: 'scheduled', notes: 'Annual dental exam' },
      { petId: 11, vetName: 'Dr. Aquatic', clinicName: 'Aquatic Pet Specialists', date: '2026-03-01', time: '11:00 AM', reason: 'Tank health check', status: 'scheduled', cost: 50, notes: 'Bring water sample' },
      { petId: 12, vetName: 'Dr. Exotic', clinicName: 'Exotic Animal Hospital', date: '2026-02-20', time: '10:00 AM', reason: 'Dental check', status: 'scheduled', cost: 100, notes: 'Teeth may need trimming' },
      { petId: 13, vetName: 'Dr. Exotic', clinicName: 'Exotic Animal Hospital', date: '2026-01-10', time: '9:30 AM', reason: 'Feather health evaluation', status: 'scheduled', cost: 125, notes: 'Check plucking progress' },
      { petId: 14, vetName: 'Dr. Williams', clinicName: 'K9 Health Center', date: '2025-12-15', time: '3:30 PM', reason: 'IVDD recheck', status: 'completed', cost: 200, notes: 'Improvement noted' },
      { petId: 15, vetName: 'Dr. Johnson', clinicName: 'City Cat Clinic', date: '2026-02-15', time: '10:00 AM', reason: 'Kitten vaccine #3', status: 'scheduled', cost: 30, notes: 'Final kitten series' }
    ];
    await Appointment.bulkCreate(appointmentData);
    console.log('15 Appointments created');

    // Weight Logs (15+)
    const weightData = [
      { petId: 1, weight: 72, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Ideal weight' },
      { petId: 1, weight: 71, unit: 'lbs', date: '2025-11-01', bodyConditionScore: 5, notes: 'Stable' },
      { petId: 1, weight: 73, unit: 'lbs', date: '2025-10-01', bodyConditionScore: 6, notes: 'Slightly over' },
      { petId: 2, weight: 9, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Good weight' },
      { petId: 2, weight: 8.5, unit: 'lbs', date: '2025-11-01', bodyConditionScore: 4, notes: 'Lost weight during illness' },
      { petId: 3, weight: 85, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Good muscle mass' },
      { petId: 4, weight: 24, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Ideal for breed' },
      { petId: 5, weight: 18, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 6, notes: 'Monitor weight with kidney diet' },
      { petId: 6, weight: 65, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Healthy weight' },
      { petId: 7, weight: 12, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 6, notes: 'Could lose 0.5 lbs' },
      { petId: 8, weight: 60, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Good condition' },
      { petId: 9, weight: 10, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Ideal' },
      { petId: 10, weight: 28, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 6, notes: 'Needs more exercise' },
      { petId: 12, weight: 4, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Good rabbit weight' },
      { petId: 14, weight: 18, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 7, notes: 'Needs to lose weight for back health' },
      { petId: 15, weight: 11, unit: 'lbs', date: '2025-12-01', bodyConditionScore: 5, notes: 'Growing well' }
    ];
    await WeightLog.bulkCreate(weightData);
    console.log('16 Weight Logs created');

    // Activities (15+)
    const activityData = [
      { petId: 1, type: 'Walk', duration: 45, distance: 2.1, intensity: 'moderate', date: '2025-12-14', calories: 180, notes: 'Morning walk in park' },
      { petId: 1, type: 'Fetch', duration: 20, distance: 0.5, intensity: 'high', date: '2025-12-14', calories: 120, notes: 'Backyard fetch session' },
      { petId: 1, type: 'Swimming', duration: 30, distance: 0.3, intensity: 'high', date: '2025-12-13', calories: 200, notes: 'Lake swimming' },
      { petId: 2, type: 'Play', duration: 15, distance: 0, intensity: 'moderate', date: '2025-12-14', calories: 30, notes: 'Laser pointer chase' },
      { petId: 3, type: 'Walk', duration: 60, distance: 3.5, intensity: 'high', date: '2025-12-14', calories: 350, notes: 'Training walk' },
      { petId: 3, type: 'Training', duration: 30, distance: 0, intensity: 'moderate', date: '2025-12-13', calories: 100, notes: 'Obedience practice' },
      { petId: 4, type: 'Walk', duration: 20, distance: 0.8, intensity: 'low', date: '2025-12-14', calories: 60, notes: 'Short walk, hot day' },
      { petId: 6, type: 'Swimming', duration: 45, distance: 0.5, intensity: 'high', date: '2025-12-14', calories: 280, notes: 'Favorite activity' },
      { petId: 6, type: 'Walk', duration: 40, distance: 2.0, intensity: 'moderate', date: '2025-12-13', calories: 160, notes: 'Evening walk' },
      { petId: 8, type: 'Run', duration: 30, distance: 2.5, intensity: 'high', date: '2025-12-14', calories: 250, notes: 'Morning jog with owner' },
      { petId: 9, type: 'Play', duration: 10, distance: 0, intensity: 'low', date: '2025-12-14', calories: 15, notes: 'Feather toy play' },
      { petId: 10, type: 'Walk', duration: 35, distance: 1.5, intensity: 'moderate', date: '2025-12-14', calories: 100, notes: 'Neighborhood walk, lots of sniffing' },
      { petId: 12, type: 'Free Roam', duration: 120, distance: 0, intensity: 'low', date: '2025-12-14', calories: 40, notes: 'Living room exploration' },
      { petId: 13, type: 'Flight Training', duration: 15, distance: 0, intensity: 'moderate', date: '2025-12-14', calories: 20, notes: 'Recall training' },
      { petId: 14, type: 'Walk', duration: 15, distance: 0.5, intensity: 'low', date: '2025-12-14', calories: 40, notes: 'Gentle walk, flat terrain only' }
    ];
    await Activity.bulkCreate(activityData);
    console.log('15 Activities created');

    // Symptoms (15+)
    const symptomData = [
      { petId: 1, symptom: 'Excessive scratching', severity: 'mild', date: '2025-12-10', duration: '3 days', bodyArea: 'Ears', notes: 'May need ear cleaning' },
      { petId: 1, symptom: 'Reduced appetite', severity: 'mild', date: '2025-12-08', duration: '1 day', bodyArea: 'General', notes: 'Ate less than usual' },
      { petId: 2, symptom: 'Sneezing', severity: 'moderate', date: '2025-10-01', duration: '5 days', bodyArea: 'Respiratory', aiDiagnosis: 'Upper respiratory infection', notes: 'Led to vet visit' },
      { petId: 3, symptom: 'Limping', severity: 'moderate', date: '2025-09-10', duration: '2 days', bodyArea: 'Front right paw', aiDiagnosis: 'Paw pad injury', notes: 'Found laceration' },
      { petId: 4, symptom: 'Vomiting', severity: 'mild', date: '2025-12-05', duration: '1 day', bodyArea: 'Digestive', notes: 'Ate too fast' },
      { petId: 5, symptom: 'Increased thirst', severity: 'moderate', date: '2025-07-15', duration: '2 weeks', bodyArea: 'General', aiDiagnosis: 'Early kidney changes', notes: 'Led to bloodwork' },
      { petId: 6, symptom: 'Hot spots', severity: 'moderate', date: '2025-06-10', duration: '1 week', bodyArea: 'Skin', aiDiagnosis: 'Environmental allergies', notes: 'Licking and scratching' },
      { petId: 7, symptom: 'Lethargy', severity: 'mild', date: '2025-12-12', duration: '2 days', bodyArea: 'General', notes: 'Sleeping more than usual' },
      { petId: 8, symptom: 'Knee swelling', severity: 'severe', date: '2025-05-08', duration: '3 days', bodyArea: 'Left hind leg', aiDiagnosis: 'ACL tear', notes: 'Urgent vet visit needed' },
      { petId: 9, symptom: 'Watery eyes', severity: 'moderate', date: '2025-10-18', duration: '4 days', bodyArea: 'Eyes', aiDiagnosis: 'Conjunctivitis', notes: 'Common in Persians' },
      { petId: 10, symptom: 'Bad breath', severity: 'mild', date: '2025-04-01', duration: '2 weeks', bodyArea: 'Dental', aiDiagnosis: 'Dental disease', notes: 'Found fractured tooth' },
      { petId: 12, symptom: 'Soft stool', severity: 'mild', date: '2025-11-20', duration: '2 days', bodyArea: 'Digestive', notes: 'Too many treats' },
      { petId: 13, symptom: 'Bald patches', severity: 'severe', date: '2025-11-28', duration: '3 weeks', bodyArea: 'Chest', aiDiagnosis: 'Stress-related feather plucking', notes: 'Behavioral issue' },
      { petId: 14, symptom: 'Reluctance to jump', severity: 'moderate', date: '2025-11-10', duration: '1 week', bodyArea: 'Back', aiDiagnosis: 'IVDD', notes: 'Back pain signs' },
      { petId: 15, symptom: 'Runny nose', severity: 'mild', date: '2025-12-05', duration: '3 days', bodyArea: 'Respiratory', notes: 'Mild cold, resolved on own' }
    ];
    await Symptom.bulkCreate(symptomData);
    console.log('15 Symptoms created');

    // Emergency Contacts (15+)
    const emergencyData = [
      { userId: user.id, name: 'Happy Paws Veterinary Clinic', type: 'Primary Vet', phone: '(555) 123-4567', address: '123 Pet Lane, Anytown, ST 12345', hours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM', isEmergency24h: false, distance: 2.5, rating: 4.8, notes: 'Dr. Smith - primary vet' },
      { userId: user.id, name: 'City Cat Clinic', type: 'Specialist', phone: '(555) 234-5678', address: '456 Feline Ave, Anytown, ST 12345', hours: 'Mon-Fri 9AM-5PM', isEmergency24h: false, distance: 3.2, rating: 4.9, notes: 'Cat specialist - Dr. Johnson' },
      { userId: user.id, name: 'K9 Health Center', type: 'Specialist', phone: '(555) 345-6789', address: '789 Canine Blvd, Anytown, ST 12345', hours: 'Mon-Sat 8AM-7PM', isEmergency24h: false, distance: 4.1, rating: 4.7, notes: 'Orthopedic specialist - Dr. Williams' },
      { userId: user.id, name: 'Pet Emergency Hospital', type: 'Emergency', phone: '(555) 911-PETS', address: '100 Emergency Dr, Anytown, ST 12345', hours: '24/7', isEmergency24h: true, distance: 5.0, rating: 4.6, notes: '24-hour emergency care' },
      { userId: user.id, name: 'Exotic Animal Hospital', type: 'Exotic Specialist', phone: '(555) 456-7890', address: '321 Exotic Way, Anytown, ST 12345', hours: 'Tue-Sat 10AM-6PM', isEmergency24h: false, distance: 8.5, rating: 4.9, notes: 'Rabbits, birds, reptiles' },
      { userId: user.id, name: 'Aquatic Pet Specialists', type: 'Aquatic Vet', phone: '(555) 567-8901', address: '555 Ocean Blvd, Anytown, ST 12345', hours: 'By appointment', isEmergency24h: false, distance: 12.0, rating: 4.5, notes: 'Fish and aquatic pets' },
      { userId: user.id, name: 'Animal Poison Control', type: 'Poison Control', phone: '(888) 426-4435', address: 'N/A - Phone Service', hours: '24/7', isEmergency24h: true, distance: null, rating: 5.0, notes: 'ASPCA Poison Control - $95 consultation fee' },
      { userId: user.id, name: 'Pet Ambulance Service', type: 'Transport', phone: '(555) 678-9012', address: 'Mobile Service', hours: '24/7', isEmergency24h: true, distance: null, rating: 4.3, notes: 'Emergency pet transport' },
      { userId: user.id, name: 'Wagmore Pet Sitting', type: 'Pet Sitter', phone: '(555) 789-0123', address: '222 Care Lane, Anytown, ST 12345', hours: 'Flexible', isEmergency24h: false, distance: 1.5, rating: 4.8, notes: 'Trusted pet sitter - Sarah' },
      { userId: user.id, name: 'Paws & Claws Boarding', type: 'Boarding', phone: '(555) 890-1234', address: '333 Kennel Rd, Anytown, ST 12345', hours: '7AM-7PM daily', isEmergency24h: false, distance: 6.0, rating: 4.4, notes: 'Large play areas' },
      { userId: user.id, name: 'Mobile Vet Dr. Adams', type: 'Mobile Vet', phone: '(555) 901-2345', address: 'Mobile Service', hours: 'Mon-Fri 9AM-4PM', isEmergency24h: false, distance: null, rating: 4.7, notes: 'Home visit vet service' },
      { userId: user.id, name: 'PetSmart Veterinary', type: 'Retail Vet', phone: '(555) 012-3456', address: '444 Shopping Center, Anytown, ST 12345', hours: 'Mon-Sun 9AM-9PM', isEmergency24h: false, distance: 3.0, rating: 4.1, notes: 'Walk-in vaccinations available' },
      { userId: user.id, name: 'Gentle Touch Rehab', type: 'Rehabilitation', phone: '(555) 123-7890', address: '555 Rehab Center, Anytown, ST 12345', hours: 'Mon-Fri 8AM-5PM', isEmergency24h: false, distance: 7.0, rating: 4.8, notes: 'Hydrotherapy and physical therapy' },
      { userId: user.id, name: 'Pet Insurance Claims', type: 'Insurance', phone: '(800) 555-PETS', address: 'N/A - Phone/Online', hours: 'Mon-Fri 8AM-8PM', isEmergency24h: false, distance: null, rating: 4.0, notes: 'For filing insurance claims' },
      { userId: user.id, name: 'Neighbor - Jane Wilson', type: 'Emergency Contact', phone: '(555) 234-0000', address: '125 Pet Lane, Anytown, ST 12345', hours: 'Anytime', isEmergency24h: true, distance: 0.1, rating: 5.0, notes: 'Neighbor, can check on pets in emergency' }
    ];
    await EmergencyContact.bulkCreate(emergencyData);
    console.log('15 Emergency Contacts created');

    // Insurance (15+)
    const insuranceData = [
      { petId: 1, provider: 'Healthy Paws', policyNumber: 'HP-2025-001', planType: 'Accident & Illness', monthlyPremium: 45.99, deductible: 250, coverageLimit: 999999, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, cancer, emergency care, genetic conditions', notes: 'No annual limit' },
      { petId: 2, provider: 'Petplan', policyNumber: 'PP-2025-002', planType: 'Comprehensive', monthlyPremium: 32.50, deductible: 200, coverageLimit: 15000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, dental, behavioral', notes: 'Covers dental illness' },
      { petId: 3, provider: 'Embrace', policyNumber: 'EM-2025-003', planType: 'Accident & Illness', monthlyPremium: 55.00, deductible: 300, coverageLimit: 30000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, orthopedic, exam fees', notes: 'Diminishing deductible' },
      { petId: 4, provider: 'Trupanion', policyNumber: 'TR-2025-004', planType: 'Medical Insurance', monthlyPremium: 38.00, deductible: 200, coverageLimit: 999999, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: '90% of vet bills after deductible', notes: 'Lifetime per-condition deductible' },
      { petId: 5, provider: 'Nationwide', policyNumber: 'NW-2025-005', planType: 'Whole Pet', monthlyPremium: 52.00, deductible: 250, coverageLimit: 999999, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Everything including wellness, dental, behavioral', notes: 'Most comprehensive coverage' },
      { petId: 6, provider: 'ASPCA', policyNumber: 'AS-2025-006', planType: 'Complete Coverage', monthlyPremium: 42.00, deductible: 250, coverageLimit: 10000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, behavioral, alternative therapies', notes: 'Good for allergies' },
      { petId: 7, provider: 'Pets Best', policyNumber: 'PB-2025-007', planType: 'BestBenefit', monthlyPremium: 28.00, deductible: 200, coverageLimit: 5000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, exam fees', notes: 'Budget-friendly option' },
      { petId: 8, provider: 'Figo', policyNumber: 'FG-2025-008', planType: 'Ultimate', monthlyPremium: 60.00, deductible: 500, coverageLimit: 999999, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, cancer, ACL, hip dysplasia', notes: 'Cloud-based claims' },
      { petId: 9, provider: 'Lemonade', policyNumber: 'LM-2025-009', planType: 'Accident & Illness', monthlyPremium: 25.00, deductible: 100, coverageLimit: 20000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, diagnostics', notes: 'Fast claims processing' },
      { petId: 10, provider: 'Spot', policyNumber: 'SP-2025-010', planType: 'Platinum', monthlyPremium: 35.00, deductible: 200, coverageLimit: 999999, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, dental disease, microchip', notes: 'Dental disease covered' },
      { petId: 11, provider: 'Exotic Pet Insurance', policyNumber: 'EX-2025-011', planType: 'Exotic Basic', monthlyPremium: 15.00, deductible: 100, coverageLimit: 2000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Illness, accidents for exotic pets', notes: 'Limited fish coverage' },
      { petId: 12, provider: 'Nationwide Exotic', policyNumber: 'NE-2025-012', planType: 'Avian & Exotic', monthlyPremium: 20.00, deductible: 50, coverageLimit: 5000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, lab work', notes: 'One of few rabbit insurers' },
      { petId: 13, provider: 'Nationwide Exotic', policyNumber: 'NE-2025-013', planType: 'Avian & Exotic', monthlyPremium: 22.00, deductible: 50, coverageLimit: 5000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, lab work, behavioral', notes: 'Parrot coverage' },
      { petId: 14, provider: 'Healthy Paws', policyNumber: 'HP-2025-014', planType: 'Accident & Illness', monthlyPremium: 65.00, deductible: 500, coverageLimit: 999999, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'IVDD, accidents, illnesses', notes: 'Higher premium due to breed risk' },
      { petId: 15, provider: 'Pumpkin', policyNumber: 'PK-2025-015', planType: 'Best Petplan', monthlyPremium: 22.00, deductible: 100, coverageLimit: 20000, startDate: '2025-01-01', endDate: '2025-12-31', coveredItems: 'Accidents, illnesses, preventive care add-on', notes: 'Great kitten coverage' }
    ];
    await Insurance.bulkCreate(insuranceData);
    console.log('15 Insurance records created');

    // Grooming (15+)
    const groomingData = [
      { petId: 1, service: 'Full Grooming', provider: 'Pampered Paws Salon', date: '2025-12-01', nextDate: '2026-02-01', cost: 75, duration: '2 hours', notes: 'Bath, haircut, nails, ears' },
      { petId: 1, service: 'Nail Trim', provider: 'PetSmart Grooming', date: '2025-12-10', nextDate: '2026-01-10', cost: 15, duration: '15 min', notes: 'Quick nail trim' },
      { petId: 2, service: 'Bath & Brush', provider: 'Kitty Spa', date: '2025-11-15', nextDate: '2026-02-15', cost: 45, duration: '1 hour', notes: 'Gentle cat bath' },
      { petId: 3, service: 'De-shedding Treatment', provider: 'Pampered Paws Salon', date: '2025-11-20', nextDate: '2026-01-20', cost: 85, duration: '2.5 hours', notes: 'Heavy shedder needs frequent grooming' },
      { petId: 4, service: 'Bath & Nail Trim', provider: 'PetSmart Grooming', date: '2025-12-05', nextDate: '2026-01-05', cost: 40, duration: '45 min', notes: 'Clean skin folds thoroughly' },
      { petId: 5, service: 'Full Grooming', provider: 'Kitty Spa', date: '2025-10-15', nextDate: '2025-12-15', cost: 95, duration: '3 hours', notes: 'Maine Coon full coat care, mat removal' },
      { petId: 6, service: 'Bath & Brush', provider: 'Pampered Paws Salon', date: '2025-12-08', nextDate: '2026-02-08', cost: 65, duration: '1.5 hours', notes: 'Hypoallergenic shampoo' },
      { petId: 7, service: 'Nail Trim', provider: 'Happy Paws Vet Clinic', date: '2025-11-01', nextDate: '2026-01-01', cost: 15, duration: '10 min', notes: 'Done during vet visit' },
      { petId: 8, service: 'Bath', provider: 'PetSmart Grooming', date: '2025-12-03', nextDate: '2026-01-03', cost: 50, duration: '1 hour', notes: 'Short coat, easy bath' },
      { petId: 9, service: 'Daily Brushing', provider: 'Owner (at home)', date: '2025-12-14', nextDate: '2025-12-15', cost: 0, duration: '15 min', notes: 'Must be brushed daily to prevent mats' },
      { petId: 9, service: 'Professional Grooming', provider: 'Kitty Spa', date: '2025-11-01', nextDate: '2026-01-01', cost: 100, duration: '3 hours', notes: 'Persian full coat grooming, eye cleaning' },
      { petId: 10, service: 'Bath & Ear Cleaning', provider: 'Pampered Paws Salon', date: '2025-12-01', nextDate: '2026-02-01', cost: 55, duration: '1 hour', notes: 'Beagle ears need regular cleaning' },
      { petId: 12, service: 'Nail Trim', provider: 'Owner (at home)', date: '2025-12-10', nextDate: '2026-01-10', cost: 0, duration: '10 min', notes: 'Careful with rabbit nails' },
      { petId: 13, service: 'Feather & Beak Care', provider: 'Exotic Animal Hospital', date: '2025-12-01', nextDate: '2026-03-01', cost: 35, duration: '30 min', notes: 'Beak filing, feather check' },
      { petId: 14, service: 'Full Grooming', provider: 'Pampered Paws Salon', date: '2025-12-07', nextDate: '2026-02-07', cost: 55, duration: '1.5 hours', notes: 'Gentle handling due to back issues' },
      { petId: 15, service: 'Kitten Bath', provider: 'Kitty Spa', date: '2025-12-12', nextDate: '2026-03-12', cost: 30, duration: '30 min', notes: 'First professional grooming' }
    ];
    await Grooming.bulkCreate(groomingData);
    console.log('16 Grooming records created');

    // Health Reports (15+)
    const healthReportData = [
      { petId: 1, reportType: 'Annual Wellness Report', generatedDate: '2025-12-15', summary: 'Buddy is in excellent health. Weight is stable at 72 lbs.', details: 'All bloodwork normal. Heart and lungs clear. Dental health good with mild tartar. Joints show no signs of dysplasia.', recommendations: 'Continue current diet, maintain exercise routine, schedule dental cleaning in 6 months', riskLevel: 'low', aiGenerated: true },
      { petId: 2, reportType: 'Post-Illness Recovery Report', generatedDate: '2025-10-19', summary: 'Luna has recovered from URI. Weight returning to normal.', details: 'Respiratory symptoms resolved. Appetite returned. Weight back to 9 lbs from 8.5 lbs low.', recommendations: 'Monitor for recurrence, boost immune system with supplements', riskLevel: 'low', aiGenerated: true },
      { petId: 3, reportType: 'Behavioral Health Report', generatedDate: '2025-12-05', summary: 'Max shows leash reactivity that needs addressing.', details: 'Reactivity is increasing in frequency. Aggression toward other dogs on walks. Otherwise healthy and well-muscled.', recommendations: 'Professional behaviorist consultation recommended, consider BAT training protocol', riskLevel: 'moderate', aiGenerated: true },
      { petId: 4, reportType: 'Post-Surgery Report', generatedDate: '2025-08-15', summary: 'Bella recovering well from spay surgery.', details: 'Incision healing nicely. No signs of infection. Energy levels returning to normal.', recommendations: 'Continue restricted activity for 1 more week, remove e-collar at day 14', riskLevel: 'low', aiGenerated: true },
      { petId: 5, reportType: 'Kidney Health Monitoring', generatedDate: '2025-12-01', summary: 'Whiskers kidney values require monitoring. Stable but elevated.', details: 'BUN and creatinine slightly elevated. SDMA at 18 (early kidney disease range). Weight stable.', recommendations: 'Continue renal diet, recheck bloodwork in 3 months, increase water intake', riskLevel: 'moderate', aiGenerated: true },
      { petId: 6, reportType: 'Allergy Management Report', generatedDate: '2025-12-01', summary: 'Daisy allergy management shows improvement on Apoquel.', details: 'Skin lesions reduced by 80%. Scratching frequency decreased. Hot spots resolved.', recommendations: 'Continue Apoquel, avoid grass during pollen season, consider immunotherapy', riskLevel: 'low', aiGenerated: true },
      { petId: 7, reportType: 'Weight Management Report', generatedDate: '2025-12-01', summary: 'Milo slightly overweight at 12 lbs. Target: 11.5 lbs.', details: 'Body condition score 6/9. Mild excess around midsection. Activity level could improve.', recommendations: 'Reduce daily calories by 10%, increase play sessions to 20 min/day', riskLevel: 'low', aiGenerated: true },
      { petId: 8, reportType: 'Orthopedic Recovery Report', generatedDate: '2025-12-01', summary: 'Rocky ACL recovery progressing well after TPLO surgery.', details: 'Leg use improving. Muscle mass rebuilding. Range of motion at 85% of normal.', recommendations: 'Continue physical therapy, swimming exercise, avoid jumping for 2 more months', riskLevel: 'moderate', aiGenerated: true },
      { petId: 9, reportType: 'Eye Health Report', generatedDate: '2025-11-03', summary: 'Cleo conjunctivitis resolved with treatment.', details: 'Eye discharge cleared. No corneal ulcers detected. Tear production normal.', recommendations: 'Clean eyes daily with warm saline, monitor for recurrence, breed predisposition', riskLevel: 'low', aiGenerated: true },
      { petId: 10, reportType: 'Dental Health Report', generatedDate: '2025-05-01', summary: 'Charlie dental health needs attention after extraction.', details: 'One premolar extracted successfully. Remaining teeth show grade 2 periodontal disease. Gums healing well.', recommendations: 'Daily tooth brushing, dental chews, annual dental cleaning, soft food for recovery', riskLevel: 'moderate', aiGenerated: true },
      { petId: 11, reportType: 'Aquatic Health Report', generatedDate: '2025-09-01', summary: 'Nemo healthy. Tank parameters need adjustment.', details: 'Fish appears active and eating well. pH slightly low at 7.8 (target 8.1-8.4). Salinity normal.', recommendations: 'Adjust pH gradually, weekly water changes, monitor ammonia levels', riskLevel: 'low', aiGenerated: true },
      { petId: 12, reportType: 'Rabbit Wellness Report', generatedDate: '2025-08-20', summary: 'Thumper in good health. Teeth and digestion normal.', details: 'Weight stable at 4 lbs. Teeth aligned properly. Fecal pellets normal. Cecotropes being consumed.', recommendations: 'Maintain unlimited hay, annual dental checks, keep nails trimmed', riskLevel: 'low', aiGenerated: true },
      { petId: 13, reportType: 'Avian Behavioral Report', generatedDate: '2025-12-01', summary: 'Polly feather plucking is concerning and worsening.', details: 'Bald patches on chest expanding. Blood tests normal - behavioral cause likely. Plucking increases when alone.', recommendations: 'Environmental enrichment, foraging toys, consider companion bird, AviCalm supplement', riskLevel: 'high', aiGenerated: true },
      { petId: 14, reportType: 'IVDD Management Report', generatedDate: '2025-12-15', summary: 'Ziggy IVDD management showing improvement with medication.', details: 'Pain levels reduced. Willing to walk short distances. No neurological deficits. Weight needs to decrease.', recommendations: 'Continue gabapentin and Dasuquin, strict weight loss program, ramp access only, no stairs', riskLevel: 'moderate', aiGenerated: true },
      { petId: 15, reportType: 'Kitten Growth Report', generatedDate: '2025-12-01', summary: 'Shadow growing well. On track for healthy development.', details: 'Weight at 11 lbs, appropriate for age. Socialization progressing. Kitten vaccines on schedule.', recommendations: 'Complete vaccine series, spay at 6 months, continue kitten food until 12 months', riskLevel: 'low', aiGenerated: true }
    ];
    await HealthReport.bulkCreate(healthReportData);
    console.log('15 Health Reports created');

    console.log('\n✅ Database seeded successfully!');
    console.log('Login: demo@petmonitor.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
