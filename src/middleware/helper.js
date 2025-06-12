const helper = {
  fieldValidator: (fields) => {
    const arr = [];
    Object.keys(fields).forEach((e) => {
      if (!fields[e]) arr.push(e?.toString(+", ").replaceAll("_", " "));
      else if (fields[e]?.toString() === "")
        arr.push(e?.toString(+", ").replaceAll("_", " "));
    });
    return arr;
  },
  responseHandler: ({ status, data, error }) => {
    if (status === 200) {
      return data
        ? { message: "success", status, data: data }
        : { message: "success", status };
    } else if (status === 400) {
      return { message: "Bad request", status, error };
    } else if (status === 405) {
      return { message: "Method not allowed", status, error };
    } else if (status === 404) {
      return { message: "Not found", status, error };
    } else if (status === 401) {
      return { message: "Unauthorized", status, error };
    } else if (status === 500) {
      return { message: "Request failed", status, error };
    } else {
      return { message: "Request failed", status, error };
    }
  },
  validateEmail: (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  },
  validatePhoneNumber: (number) => {
    if (number.length !== 13 && number.slice(0, 3) !== "234") return false;
    else return true;
  },
};

module.exports = helper;
