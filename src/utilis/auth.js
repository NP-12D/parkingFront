 const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("ტოკენი არ არის ვალიდური JWT ფორმატის!");
      localStorage.removeItem("token");
      return null;
    }

    // 1. Base64URL-ის სტანდარტულ Base64-ში გადაყვანა
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    // 2. Unicode/UTF-8 სიმბოლოების უსაფრთხო დეკოდირება (ქართული ასოებისთვის)
    const jsonPayload = decodeURIComponent(
      Array.prototype.map
        .call(window.atob(base64), (c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // 3. ვადაგასულობის შემოწმება (exp)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn("ტოკენს ვადა გაუვიდა!");
      localStorage.removeItem("token");
      return null;
    }

    // 4. სახელი ან Email-ის ფოლბექი
    const fallbackName = payload.email ? payload.email.split("@")[0] : "მომხმარებელი";

    return {
      ...payload,
      name: payload.name || fallbackName,
    };
  } catch (error) {
    console.error("JWT ტოკენის დეკოდირების შეცდომა:", error);
    localStorage.removeItem("token");
    return null;
  }
};
export default getUserFromToken;