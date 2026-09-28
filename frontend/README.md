# Plume - Simple Version (readable code, seekhne ke liye)

Ye wahi Plume app hai (design bilkul same), lekin code **beginner-friendly** tareeqe se likha gaya hai.

## Kaise chalayein
`index.html` par double-click karein. Kuch install nahi karna. Login: `ayesha` / `password123` (ya "Fill demo login" button dabayein), ya naya account banayein.

## Ye "simple" version un advanced cheezon se bachti hai:
- Koi `async / await`, koi Promises nahi — har function turant (synchronously) jawab deta hai.
- Koi `data-action` / event-delegation system nahi — buttons par seedha `onclick="functionName()"` likha hai.
- Koi module pattern (IIFE) ya "registries" nahi — sirf seedhe, globally available functions.
- Zyadatar jagah `function` keyword (arrow functions nahi), aur `for` loops (chains ki jagah).

## Folder structure

```
index.html
css/style.css     -> design (colours, layout) - bilkul original jaisa, ismein kuch nahi badla
js/data.js        -> "fake backend": localStorage mein data, sab functions synchronous hain
js/app.js         -> poori screen: har page ek function hai, buttons onclick se jude hain
```

## Kaam kaise karta hai (3 baatein)

1. **`data.js`** aapka data sambhalta hai (users, posts, comments, likes, follows) — sab kuch browser ke `localStorage` mein. Har function seedha jawab deta hai, jaise: `var result = loginUser("ayesha", "password123");`
2. **`app.js`** screen banata hai. Har page (Home, Profile, Explore) ek function hai jo HTML ka text banakar `innerHTML` se laga deta hai.
3. Button dabane par (`onclick="handleLikeClick(5)"`) seedha wahi function chalta hai. Data badalne ke baad hum us page ko **dobara bana dete hain** (`renderCurrentPage()`), taake screen hamesha sahi dikhe.

Har function ke upar Roman Urdu mein comment hai ki wo kya karta hai — file khol kar upar se neeche padhte jayein.
