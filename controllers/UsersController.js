import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew (request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
    }

    const hashPwd = sha1(password);

    try {
      const collection = dbClient.db.collection('users');
      const user1 = await collection.findOne({ email });

      if (user1) {
        response.status(400).json({ error: 'Already exist' });
      } else {
        collection.insertOne({ email, password: hashPwd });
        const newUser = await collection.findOne(
          { email }, { projection: { email: 1 } }
        );
        response.status(201).json({ id: newUser._id, email: newUser.email });
      }
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }

  static async getMe (request, response) {
    try {
      const userToken = request.header('X-Token');
      const authKey = `auth_${userToken}`;
      // console.log('USER TOKEN GET ME', userToken);
      const userID = await redisClient.get(authKey);
      console.log('USER KEY GET ME', userID);
      if (!userID) {
        response.status(401).json({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUser({ _id: ObjectId(userID) });
      // console.log('USER GET ME', user);
      response.json({ id: user._id, email: user.email });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
// export default postNew();
