# CounterAPI
This API allows you to create simple numeric counters.

It goes as:
* Create a counter and restrict its operations
* Reset the value of a counter
* Increment / Decrement a counter

All counters are accesible if you know the key and there are not private counter.

Want to track the number of hits a page had? Sure.
Want to know the number of users that clicked on the button "View More"? There you go.

# Example 
### Regular use
```
https://localhost:8080/hit/:NameSpace/:Key
```
### Using XHR 
```js
var xhr = new XMLHttpRequest();
xhr.open("GET", "https://localhost:8080/hit/example.com/visits");
xhr.responseType = "json";
xhr.onload = function() {
    console.log(this.response.value);
}
xhr.send();
```
### Using jQuery
```js
$.getJSON("https://localhost:8080/hit/example.com/visits", function(response){
    console.log(response.value);
})
```

## Multiple pages
if you want to have a counter for each individual page you can replace visits with a unique identifier for each page, i.e index, contact, item-1, item-2. 

Keys and namespaces must have at least 3 characters and less or equal to 64.

# API
## Namespaces
Namespaces are meant to avoid name collisions. You may specify a namespace during the creation of a key. Its recommend use the domain of the application as namespace to avoid collision with other websites.

If the namespace is not specified the key is assigned to the **default** namespace. If your key resides in the default namespace you don't need to specify it.

## Endpoints 
All requests support cross-origin resource sharing (CORS) and SSL.

Base API path: `https://localhost:8080`

### `/hit/:namespace/:key`
This endpoint will create a key if it doesn't exist and increment it by one on each subsequent request.

### `/get/:namespace/:key`
Get the value of a key.

### `/set/:namespace/:key?value=:newValue`
Set the value of a key.

<br>
made by Asadbek Karimov