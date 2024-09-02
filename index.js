const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const cron = require("node-cron");
const dayjs = require("dayjs");

const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

app.use(cors(corsOptions));
app.use(express.json());

const tasks = [];

app.post("/schedule-email", (req, res) => {
  const { id, email, day, time, notification, interval, count } = req.body;
  console.log("came ", id, email, day, time, notification, interval, count);

  res.json({ status: "Email scheduled!" });

  const text = `Hello! \n
  This is Andryi. You’ve requested notifications about ${notification}.\n  
  Have a great day,\n  
  Andryi`;

  const presentTasks = tasks.filter((item) => item.id === id);

  const createTask = (i = 0) => {
    const newTime = dayjs(`2024-08-22T${time}`).add(interval * i, "minute");
    const minute = dayjs(newTime).format("m");
    const hour = dayjs(newTime).format("H");

    const newTask = cron.schedule(
      `${minute} ${hour} * * ${day}`,
      () => {
        sendEmail(email, "letter", text);
      },
      { scheduled: true }
    );

    return newTask;
  };

  if (presentTasks.length) {
    let i = 0;
    tasks.map((item) => {
      if (item.id === id) {
        item.task.stop();
        item.task = createTask(i);
        i++;
      }
    });
  }

  if (!presentTasks.length) {
    for (let i = 0; i <= count; i++) {
      const newTask = createTask(i);
      tasks.push({ id: id, task: newTask });
    }
  }

  const taskToStart = tasks.find((item) => item.id === id);

  taskToStart.task.start();
});

function sendEmail(email, subject, message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "girskiy.andrey@gmail.com",
      pass: "xfxa iomu ummn vhyp",
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
