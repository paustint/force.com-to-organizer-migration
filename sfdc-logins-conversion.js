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
  var xmlDOM = new DOMParser().parseFromString(xml, 'text/xml');
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