# Conversion from Force.com LOGINS to ORGanizer
This script allows converting exported XML from 
[force.com LOGINS](https://chrome.google.com/webstore/detail/forcecom-logins/ldjbglicecgnpkpdhpbogkednmmbebec?hl=en)
to a format that can be imported to 
[ORGanizer](https://chrome.google.com/webstore/detail/organizer-for-salesforce/lojdmgdchjcfnmkmodggbaafecagllnh?hl=en).

### Converting your logins
1. Open up Force.com LOGINS and go to the export page and copy the XML
2. Open up the broswer javascript console. (right click on your current webpage, choose inspect, click console tab)
3. Create a new variable named xml and paste the XML as the value of the variable.
  - **NOTE** Use backtick (shred on ~ key) because the XML is a multilines string with linebreaks.
  - (use the XML from your plugin): `var xmlString = \`<root><groups>foo</groups><accounts>bar</accounts></root>\``
4. Paste the javascript into the console and press enter
5. run `reduceLogins(xmlString)`.

This will print a JSON string you can copy and paste into a text editor and save as a `.json` file and import into the ORGanizer import page (right click on extension icon and choose options).

**note:** Make sure to remove the outer `"` from the printed JSON when saving as a file.

### Script to paste into browser console

```javascript
function xmlToJson(xml) {
	var obj = {};
	if (xml.nodeType == 1) { // element
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}
	if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
		obj = xml.childNodes[0].nodeValue;
	}
	else if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
}

function reduceLogins(xmlString) {
  var xmlDOM = new DOMParser().parseFromString(xmlString, 'text/xml');
  const logins = xmlToJson(xmlDOM);
  const groupMap = logins.root.groups.group.reduce((acc, curr) => {
    const item = curr['@attributes'];
    acc[item.id] = unescape(item.name);
    return acc;
  }, {});
  const accounts = logins.root.accounts.account.reduce((acc, curr) => {
    const item = curr['@attributes'];
    acc.push({
      group: groupMap[item.groupid],
      baseUrl: unescape(item.baseUrl),
      orgType: item.orgType,
      username: item.username,
      password: unescape(item.password),
      token: unescape(item.token),
      description: unescape(item.description),
    });
    return acc;
  }, []).map(item => {
    return {
        g: item.group,
        n: item.username,
        p: item.password,
        r: item.orgType === 'PROD' ? '0' : (item.orgType === 'SANDBOX' ? '1' : item.baseUrl),
        s: true,
        lt : false,
        t: item.token,
        u: item.username,
    }
  });
  return JSON.stringify({ accounts }, null, 2);
}
```