import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'asemelbadahy@gmail.com',
    pass: process.env.GMAIL!,
  },
});

export default transporter;
