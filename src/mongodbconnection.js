import React, { useState, useEffect } from 'react';
import { MongoClient } from 'mongodb';

const MongoDBConnection = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const connectToMongoDB = async () => {
      try {
        // Remplacer les valeurs suivantes avec vos propres informations de connexion MongoDB Atlas
        const uri = "mongodb+srv://test:test@cluster0.ls5if.mongodb.net/";
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Connexion à la base de données
        await client.connect();
        console.log("Connecté à MongoDB Atlas");

        // Accès à une collection
        const collection = client.db("your-database").collection("your-collection");

        // Effectuer des opérations sur la collection
        const result = await collection.find({}).toArray();
        setData(result);

        // Fermeture de la connexion
        await client.close();
        console.log("Connexion à MongoDB Atlas fermée");
      } catch (err) {
        console.error("Erreur lors de la connexion à MongoDB Atlas:", err);
      }
    };

    connectToMongoDB();
  }, []);

  return (
    <div>
      <h1>Données récupérées depuis MongoDB Atlas</h1>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
};

export default MongoDBConnection;