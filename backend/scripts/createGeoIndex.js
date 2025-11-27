require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function createGeoIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whisper-echo';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    
    const db = mongoose.connection.db;
    const postsCollection = db.collection('posts');
    
    console.log('\n🔍 Checking existing indexes...');
    const existingIndexes = await postsCollection.indexes();
    console.log('Existing indexes:', existingIndexes.map(idx => idx.name));
    
    // Check if geoLocation index exists
    const hasGeoIndex = existingIndexes.some(idx => 
      idx.name === 'geoLocation_2dsphere' || 
      (idx.key && idx.key.geoLocation === '2dsphere')
    );
    
    if (hasGeoIndex) {
      console.log('✅ Geospatial index already exists!');
    } else {
      console.log('\n🔨 Creating geospatial index...');
      await postsCollection.createIndex({ geoLocation: '2dsphere' });
      console.log('✅ Geospatial index created successfully!');
    }
    
    console.log('\n📋 Final indexes:');
    const finalIndexes = await postsCollection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
    });
    
    console.log('\n✨ Index setup complete!');
    console.log('🎉 City Radar is ready to use!');
    
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating geospatial index:', error);
    process.exit(1);
  }
}

createGeoIndex();
