export function SendEmail() {
    var _0x4cddbe = {
        'from': 'CustomerService@unifresh.com.au',
        'to': "technology@unifresh.com.au",
        'subject': "Dominos Ordering",
        'html': "
            
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