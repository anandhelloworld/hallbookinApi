import express from "express";
const app = express();
const port = process.env.PORT||8000;


import { MongoClient } from "mongodb";
// const MONGO_URL = "mongodb://localhost";
const MONGO_URL = "mongodb+srv://anand:TmF7ogJ1ALhcWFxO@allproject.p2rbwnr.mongodb.net/?retryWrites=true&w=majority"; //  nodejs - 16+

// Node - MongoDB
async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌😊");
  return client;
}

const client = await createConnection();

/*
room={
    room id:
    number:
    no of seats:
    amanities:
    price per hour:
    status:
    date:
    start time:
    end time:
    customer name:
}
roomStatus={
    roomid:
}
customer{
    name:
    booked room:
    date:
    start:
    end:
}
*/
app.use(express.json());

//Endpoint to create a room and if booked while creating customer is updated:
app.post("/addroom", async (req, res) => {
  let room = req.body;
  //console.log("room", room.status);
  if (room.status == "booked") {
   // console.log("Dvdfvsv");
    const customer = {
      name: room.customer_name,
      booked_room: room.room_id,
      start_time: room.start_time,
      end_time: room.end_time,
      date: room.date,
    };
    console.log("customer:  ", customer);
    const customer_details = await client
      .db("hall")
      .collection("customer")
      .insertOne(customer);
  }

  const result = await client.db("hall").collection("rooms").insertOne(room);
  res.send(result);
});

/*List all the booked  rooms with
room name
bookes status
customer name
date
start time
end time
*/

//to get all the rooms
app.get("/allrooms", async (req, res) => {
  const result = await client.db("hall").collection("rooms").find().toArray();
  res.send(result);
});

/*All customer with booked data
customer name
room name
start time
end time
*/
//to get all the customer data
app.get("/allcustomers", async (req, res) => {
  const result = await client
    .db("hall")
    .collection("customer")
    .find()
    .toArray();
  res.send(result);
});

/*Book a room with following details
customer name
date
start time
end time
room id
*/
//to book a room check first all the empty room and then assign one room status to booked and update that room details:

app.post("/bookroom", async (req, res) => {
  let empty_rooms = [];
  const customer_details = req.body;
  const allrooms = await client.db("hall").collection("rooms").find().toArray();
  allrooms.forEach((room) => {
    if (room.status != "booked") {
      empty_rooms.push(room.room_id);
    }
  });
  //console.log("rooms: ", empty_rooms);

  if (empty_rooms.length) {
    const customer = {
      name: customer_details.customer_name,
      booked_room: empty_rooms[0],
      start_time: customer_details.start_time,
      end_time: customer_details.end_time,
      date: customer_details.date,
    };
    const customerUpdate = await client
      .db("hall")
      .collection("customer")
      .insertOne(customer);

    const roomUpdate = await client
      .db("hall")
      .collection("rooms")
      .updateOne(
        { room_id: empty_rooms[0] },
        {
          $set: {
            status: "booked",
            customer_name: customer_details.customer_name,
            date: customer_details.date,
            start_time: customer_details.start_time,
            end_time: customer_details.end_time,
          },
        }
      );

    // res.send(customerUpdate);
    res.send(roomUpdate);
  } else {
   // console.log("no empty rooms found");
    res.send("no empty rooms found");
  }
});

app.get("/", (req, res) => {
  let text =
    "Booking app api:1)create rooms and can be booked while creating  2) book room with first room first order  3)show all rooms 4)show all customer data";
  let infor={
    APP:"Hall/Room booking app",
    createRoom:{
      
    },
    bookRomm:"",
    ShowlAllRoom:"",
    showAllCustomerData:"",
  }
  res.send(text);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
