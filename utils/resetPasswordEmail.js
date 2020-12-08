import sgMail from "@sendgrid/mail";

const resetPasswordEmail = async (options) => {
  sgMail.setApiKey(process.env.SEND_GRID_KEY);

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<a href=${options.url}><button>Click Here</button></a>`,
  };
  await sgMail.send(message);
};
export default resetPasswordEmail;
