const template = ({ user, token, content }) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />
  </head>
  <body style="background-color: #fff; padding: 20px 50px">
    <div
      style="
        width: 90%;

        margin: auto;
        padding: 40px;
        background-color: #475467;
      "
    >
      <div
        width="100px"
        style="
          border-radius: 50px;
          margin-top: 30px;
          margin: auto;
          background-position: center;
          background-size: contain;
          height: 120px;

          background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723255331/Screenshot_2024-08-10_at_01.12.19_1_uc1j5p.png);
          background-repeat: no-repeat;
        "
      ></div>
      <div
        style="
          color: #fff;
          text-align: center;
          font-size: 18px;
          font-weight: 800;
          margin: auto;
          margin-top: 20px;
        "
      >
        FHA RENEWED HOPE ESTATES
      </div>
    </div>
${content.snippet(user, token)}
    
    <div
      style="
        margin: auto;
        background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723255584/Screenshot_2024-06-25_at_15.30.48_1_1_chlgqr.png);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        height: 97px;
        padding: 40px;
        width: 90%;
      "
    >
      <div
        style="
          color: #fff;
          font-size: 14px;
          text-align: center;
          font-weight: 500;
          z-index: 9999;
        "
      >
        Connect with us via our Social Media:
      </div>

      <div
        style="
          display: flex;
          justify-content: center;
          gap: 20px;
          align-items: center;
          margin: auto;
          z-index: 99999;
          margin-top: 40px;
        "
      >
        <div
          style="
            margin: auto;
            display: flex;
            justify-content: center;
            align-items: center;
          "
        >
          <a style="margin: 0 20px" href="">
            <div
              style="
                width: 24px;
                height: 24px;
                background-size: contain;
                background-position: center;
                background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723255744/Dribbble_udceid.png);
              "
            ></div>
          </a>

          <a style="margin: 0 20px" href="">
            <div
              style="
                width: 24px;
                height: 24px;
                background-size: contain;
                background-position: center;
                background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723258034/Instagram_h57zcn.png);
              "
            ></div>
          </a>

          <a style="margin: 0 20px" href="">
            <div
              style="
                width: 24px;
                height: 24px;
                background-size: contain;
                background-position: center;
                background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723258097/Twitter_oryzgn.png);
              "
            ></div>
          </a>

          <a style="margin: 0 20px" href="">
            <div
              style="
                width: 24px;
                height: 24px;
                background-size: contain;
                background-position: center;
                background-image: url(https://res.cloudinary.com/fullstack-login-register/image/upload/v1723258190/Youtube_t3ebfv.png);
              "
            ></div>
          </a>
        </div>
      </div>
    </div>
  </body>
</html>
`;
};

module.exports = template;
