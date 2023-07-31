import userModel from "../models/user.model.js";

class UserService {
  async create(data) {
    const newUser = await userModel.create(data);
    return newUser;
  }

  async find(type, event_type, state, city) {
    const query = {};

    if (type !== undefined) {
      query.type = type;
    }
    if (event_type !== undefined) {
      query.event_type = event_type;
    }
    if (state !== undefined) {
      query.state = state;
    }
    if (city !== undefined) {
        query.city = city;
      }


    const user = await userModel.find(query);
    return user;
  }
}
export default new UserService();