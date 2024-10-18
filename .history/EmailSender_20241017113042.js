export function SendEmail() {
    var _0x4cddbe = {
        'from': 'CustomerService@unifresh.com.au',
        'to': "technology@unifresh.com.au",
        'subject': "Dominos Ordering",
        'html': "
            \n                \n                <!DOCTYPE html>\n
<html>
   \n
   <head>
      \n
      <style>\n#customers {\n  font-family: Arial, Helvetica, sans-serif;\n  border-collapse: collapse;\n  width: 100%;\n}\n\n#customers td, #customers th {\n  border: 1px solid #ddd;\n  padding: 8px;\n}\n\n#customers tr:nth-child(even){background-color: #f2f2f2;}\n\n#customers tr:hover {background-color: #ddd;}\n\n#customers th {\n  padding-top: 12px;\n  padding-bottom: 12px;\n  text-align: left;\n  background-color: #04AA6D;\n  color: white;\n}\n</style>
      \n
   </head>
   \n
   <body>
      \n\n
      <h4>Order Placed</h4>
      \n
      <h4>" + _0x4a2fce + "</h4>
      \n
      <h4>Required Date: " + _0x3eb79e + "</h4>
      \n
      <h4>Unifresh Invoice Number: " + _0x5144df.xml.invoice._text + "</h4>
      \n
      <h4>Unifresh Invoice Number: Invalid Order Date</h4>
      \n\n
      <table id=\"customers\">
         \n  
         <tr>
            \n    
            <th>Item Code</th>
            \n    
            <th>Quantity</th>
            \n  
         </tr>
         \n    
         <tr>
            \n      
            <td>" + (_0x50b803[0x0] == undefined ? '' : _0x50b803[0x0].Name) + "</td>
            \n      
            <td>" + (_0x50b803[0x0] == undefined ? '' : _0x50b803[0x0].Quentity) + "</td>
            \n    
         </tr>
         \n    
         <tr>
            \n      
            <td>" + (_0x50b803[0x1] == undefined ? '' : _0x50b803[0x1].Name) + "</td>
            \n      
            <td>" + (_0x50b803[0x1] == undefined ? '' : _0x50b803[0x1].Quentity) + "</td>
            \n    
         </tr>
         \n    
         <tr>
            \n      
            <td>" + (_0x50b803[0x2] == undefined ? '' : _0x50b803[0x2].Name) + "</td>
            \n      
            <td>" + (_0x50b803[0x2] == undefined ? '' : _0x50b803[0x2].Quentity) + "</td>
            \n    
         </tr>
         \n    
         <tr>
            \n      
            <td>" + (_0x50b803[0x3] == undefined ? '' : _0x50b803[0x3].Name) + "</td>
            \n      
            <td>" + (_0x50b803[0x3] == undefined ? '' : _0x50b803[0x3].Quentity) + "</td>
            \n    
         </tr>
         \n    
         <tr>
            \n      
            <td>" + (_0x50b803[0x4] == undefined ? '' : _0x50b803[0x4].Name) + "</td>
            \n      
            <td>" + (_0x50b803[0x4] == undefined ? '' : _0x50b803[0x4].Quentity) + "</td>
            \n    
         </tr>
         \n   
         <tr>
            \n      
            <td>" + (_0x50b803[0x5] == undefined ? '' : _0x50b803[0x5].Name) + "</td>
            \n      
            <td>" + (_0x50b803[0x5] == undefined ? '' : _0x50b803[0x5].Quentity) + "</td>
            \n    
         </tr>
         \n
      </table>
      \n\n
   </body>
   \n
</html>
\n
        "
      };
      _0x50a330.sendMail(_0x4cddbe, function (_0x3e9c93, _0x3a2d62) {
        if (_0x3e9c93) {
          console.log(_0x3e9c93);
        } else {
          console.log("Email sent: " + _0x3a2d62.response);
        }
      });
}