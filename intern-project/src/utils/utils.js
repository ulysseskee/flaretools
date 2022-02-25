import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

export const Humanize = (str) => {
  var i,
    frags = str.split("_");
  for (i = 0; i < frags.length; i++) {
    if (frags[i] === "https") {
      frags[i] = "HTTPS";
    } else if (frags[i] === "ttl") {
      frags[i] = "TTL";
    } else if (frags[i] === "url") {
      frags[i] = "URL";
    } else if (frags[i] === "ssl") {
      frags[i] = "SSL";
    } else if (frags[i] === "waf") {
      frags[i] = "WAF";
    } else if (frags[i] === "ddos") {
      frags[i] = "DDoS";
    } else if (frags[i] === "js_challenge") {
      frags[i] = "JS Challenge";
    } else if (frags[i] === "http2") {
      frags[i] = "HTTP/2";
    } else if (frags[i] === "http3") {
      frags[i] = "HTTP/3 (with QUIC)";
    } else if (frags[i] === "zero_rtt") {
      frags[i] = "0-RTT Connection Resumption";
    } else if (frags[i] === "ipv6") {
      frags[i] = "IPv6 Compatibility";
    } else if (frags[i] === "grpc") {
      frags[i] = "gRPC";
    } else if (frags[i] === "websockets") {
      frags[i] = "WebSockets";
    } else if (frags[i] === "opportunistic_onion") {
      frags[i] = "Onion Routing";
    } else if (frags[i] === "pseudo_ipv4") {
      frags[i] = "Psuedo IPv4";
    } else if (frags[i] === "ip_geolocation") {
      frags[i] = "IP Geolocation";
    } else if (frags[i] === "max_upload") {
      frags[i] = "Maximum Upload Size";
    } else if (frags[i] === "true_client_ip_header") {
      frags[i] = "True-Client-IP-Header";
    } else if (frags[i] === "ipv4") {
      frags[i] = "IPv4";
    } else if (frags[i] === "ipv6") {
      frags[i] = "IPv6";
    } else {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
  }
  return frags.join(" ");
};

export const GetExpressionOutput = (expr) => {
  if (/ip.geoip.country /.test(expr)) {
    return "Country";
  } else if (/ip.geoip.continent /.test(expr)) {
    return "Continent";
  } else if (/http.host /.test(expr)) {
    return "Hostname";
  } else if (/ip.geoip.asnum /.test(expr)) {
    return "AS Num";
  } else if (/http.cookie /.test(expr)) {
    return "Cookie";
  } else if (/ip.src /.test(expr)) {
    return "IP Source Address";
  } else if (/http.referer /.test(expr)) {
    return "Referer";
  } else if (/http.request.method /.test(expr)) {
    return "Request Method";
  } else if (/ssl /.test(expr)) {
    return "SSL/HTTPS";
  } else if (/http.request.full_uri /.test(expr)) {
    return "URI Full";
  } else if (/http.request.uri /.test(expr)) {
    return "URI";
  } else if (/http.request.uri.path /.test(expr)) {
    return "URI Path";
  } else if (/http.request.uri.query /.test(expr)) {
    return "URI Query";
  } else if (/http.request.version /.test(expr)) {
    return "HTTP Version";
  } else if (/http.user_agent /.test(expr)) {
    return "User Agent";
  } else if (/http.x_forwarded_for /.test(expr)) {
    return "X-Forwarded-For";
  } else if (/cf.tls_client_auth.cert_verified /.test(expr)) {
    return "Client Certificate Verified";
  } else if (/ip.geoip.is_in_european_union /.test(expr)) {
    return "European Union";
  } else {
    return expr;
  }
};

export const CountryCodeLookup = (countryCode) => {
  const countryStore = {
    af: { code: "af", name: "Afghanistan" },
    ax: { code: "ax", name: "Åland Islands" },
    al: { code: "al", name: "Albania" },
    dz: { code: "dz", name: "Algeria" },
    as: { code: "as", name: "American Samoa" },
    ad: { code: "ad", name: "AndorrA" },
    ao: { code: "ao", name: "Angola" },
    ai: { code: "ai", name: "Anguilla" },
    aq: { code: "aq", name: "Antarctica" },
    ag: { code: "ag", name: "Antigua and Barbuda" },
    ar: { code: "ar", name: "Argentina" },
    am: { code: "am", name: "Armenia" },
    aw: { code: "aw", name: "Aruba" },
    au: { code: "au", name: "Australia" },
    at: { code: "at", name: "Austria" },
    az: { code: "az", name: "Azerbaijan" },
    bs: { code: "bs", name: "Bahamas" },
    bh: { code: "bh", name: "Bahrain" },
    bd: { code: "bd", name: "Bangladesh" },
    bb: { code: "bb", name: "Barbados" },
    by: { code: "by", name: "Belarus" },
    be: { code: "be", name: "Belgium" },
    bz: { code: "bz", name: "Belize" },
    bj: { code: "bj", name: "Benin" },
    bm: { code: "bm", name: "Bermuda" },
    bt: { code: "bt", name: "Bhutan" },
    bo: { code: "bo", name: "Bolivia" },
    ba: { code: "ba", name: "Bosnia and Herzegovina" },
    bw: { code: "bw", name: "Botswana" },
    bv: { code: "bv", name: "Bouvet Island" },
    br: { code: "br", name: "Brazil" },
    io: { code: "io", name: "British Indian Ocean Territory" },
    bn: { code: "bn", name: "Brunei Darussalam" },
    bg: { code: "bg", name: "Bulgaria" },
    bf: { code: "bf", name: "Burkina Faso" },
    bi: { code: "bi", name: "Burundi" },
    kh: { code: "kh", name: "Cambodia" },
    cm: { code: "cm", name: "Cameroon" },
    ca: { code: "ca", name: "Canada" },
    cv: { code: "cv", name: "Cape Verde" },
    ky: { code: "ky", name: "Cayman Islands" },
    cf: { code: "cf", name: "Central African Republic" },
    td: { code: "td", name: "Chad" },
    cl: { code: "cl", name: "Chile" },
    cn: { code: "cn", name: "China" },
    cx: { code: "cx", name: "Christmas Island" },
    cc: { code: "cc", name: "Cocos (Keeling) Islands" },
    co: { code: "co", name: "Colombia" },
    km: { code: "km", name: "Comoros" },
    cg: { code: "cg", name: "Congo" },
    cd: { code: "cd", name: "Congo, Democratic Republic" },
    ck: { code: "ck", name: "Cook Islands" },
    cr: { code: "cr", name: "Costa Rica" },
    ci: { code: "ci", name: 'Cote D"Ivoire' },
    hr: { code: "hr", name: "Croatia" },
    cu: { code: "cu", name: "Cuba" },
    cy: { code: "cy", name: "Cyprus" },
    cz: { code: "cz", name: "Czech Republic" },
    dk: { code: "dk", name: "Denmark" },
    dj: { code: "dj", name: "Djibouti" },
    dm: { code: "dm", name: "Dominica" },
    do: { code: "do", name: "Dominican Republic" },
    ec: { code: "ec", name: "Ecuador" },
    eg: { code: "eg", name: "Egypt" },
    sv: { code: "sv", name: "El Salvador" },
    gq: { code: "gq", name: "Equatorial Guinea" },
    er: { code: "er", name: "Eritrea" },
    ee: { code: "ee", name: "Estonia" },
    et: { code: "et", name: "Ethiopia" },
    fk: { code: "fk", name: "Falkland Islands (Malvinas)" },
    fo: { code: "fo", name: "Faroe Islands" },
    fj: { code: "fj", name: "Fiji" },
    fi: { code: "fi", name: "Finland" },
    fr: { code: "fr", name: "France" },
    gf: { code: "gf", name: "French Guiana" },
    pf: { code: "pf", name: "French Polynesia" },
    tf: { code: "tf", name: "French Southern Territories" },
    ga: { code: "ga", name: "Gabon" },
    gm: { code: "gm", name: "Gambia" },
    ge: { code: "ge", name: "Georgia" },
    de: { code: "de", name: "Germany" },
    gh: { code: "gh", name: "Ghana" },
    gi: { code: "gi", name: "Gibraltar" },
    gr: { code: "gr", name: "Greece" },
    gl: { code: "gl", name: "Greenland" },
    gd: { code: "gd", name: "Grenada" },
    gp: { code: "gp", name: "Guadeloupe" },
    gu: { code: "gu", name: "Guam" },
    gt: { code: "gt", name: "Guatemala" },
    gg: { code: "gg", name: "Guernsey" },
    gn: { code: "gn", name: "Guinea" },
    gw: { code: "gw", name: "Guinea-Bissau" },
    gy: { code: "gy", name: "Guyana" },
    ht: { code: "ht", name: "Haiti" },
    hm: { code: "hm", name: "Heard Island and Mcdonald Islands" },
    va: { code: "va", name: "Holy See (Vatican City State)" },
    hn: { code: "hn", name: "Honduras" },
    hk: { code: "hk", name: "Hong Kong" },
    hu: { code: "hu", name: "Hungary" },
    is: { code: "is", name: "Iceland" },
    in: { code: "in", name: "India" },
    id: { code: "id", name: "Indonesia" },
    ir: { code: "ir", name: "Iran" },
    iq: { code: "iq", name: "Iraq" },
    ie: { code: "ie", name: "Ireland" },
    im: { code: "im", name: "Isle of Man" },
    il: { code: "il", name: "Israel" },
    it: { code: "it", name: "Italy" },
    jm: { code: "jm", name: "Jamaica" },
    jp: { code: "jp", name: "Japan" },
    je: { code: "je", name: "Jersey" },
    jo: { code: "jo", name: "Jordan" },
    kz: { code: "kz", name: "Kazakhstan" },
    ke: { code: "ke", name: "Kenya" },
    ki: { code: "ki", name: "Kiribati" },
    kp: { code: "kp", name: "Korea (North)" },
    kr: { code: "kr", name: "Korea (South)" },
    xk: { code: "xk", name: "Kosovo" },
    kw: { code: "kw", name: "Kuwait" },
    kg: { code: "kg", name: "Kyrgyzstan" },
    la: { code: "la", name: "Laos" },
    lv: { code: "lv", name: "Latvia" },
    lb: { code: "lb", name: "Lebanon" },
    ls: { code: "ls", name: "Lesotho" },
    lr: { code: "lr", name: "Liberia" },
    ly: { code: "ly", name: "Libyan Arab Jamahiriya" },
    li: { code: "li", name: "Liechtenstein" },
    lt: { code: "lt", name: "Lithuania" },
    lu: { code: "lu", name: "Luxembourg" },
    mo: { code: "mo", name: "Macao" },
    mk: { code: "mk", name: "Macedonia" },
    mg: { code: "mg", name: "Madagascar" },
    mw: { code: "mw", name: "Malawi" },
    my: { code: "my", name: "Malaysia" },
    mv: { code: "mv", name: "Maldives" },
    ml: { code: "ml", name: "Mali" },
    mt: { code: "mt", name: "Malta" },
    mh: { code: "mh", name: "Marshall Islands" },
    mq: { code: "mq", name: "Martinique" },
    mr: { code: "mr", name: "Mauritania" },
    mu: { code: "mu", name: "Mauritius" },
    yt: { code: "yt", name: "Mayotte" },
    mx: { code: "mx", name: "Mexico" },
    fm: { code: "fm", name: "Micronesia" },
    md: { code: "md", name: "Moldova" },
    mc: { code: "mc", name: "Monaco" },
    mn: { code: "mn", name: "Mongolia" },
    ms: { code: "ms", name: "Montserrat" },
    ma: { code: "ma", name: "Morocco" },
    mz: { code: "mz", name: "Mozambique" },
    mm: { code: "mm", name: "Myanmar" },
    na: { code: "na", name: "Namibia" },
    nr: { code: "nr", name: "Nauru" },
    np: { code: "np", name: "Nepal" },
    nl: { code: "nl", name: "Netherlands" },
    an: { code: "an", name: "Netherlands Antilles" },
    nc: { code: "nc", name: "New Caledonia" },
    nz: { code: "nz", name: "New Zealand" },
    ni: { code: "ni", name: "Nicaragua" },
    ne: { code: "ne", name: "Niger" },
    ng: { code: "ng", name: "Nigeria" },
    nu: { code: "nu", name: "Niue" },
    nf: { code: "nf", name: "Norfolk Island" },
    mp: { code: "mp", name: "Northern Mariana Islands" },
    no: { code: "no", name: "Norway" },
    om: { code: "om", name: "Oman" },
    pk: { code: "pk", name: "Pakistan" },
    pw: { code: "pw", name: "Palau" },
    ps: { code: "ps", name: "Palestinian Territory, Occupied" },
    pa: { code: "pa", name: "Panama" },
    pg: { code: "pg", name: "Papua New Guinea" },
    py: { code: "py", name: "Paraguay" },
    pe: { code: "pe", name: "Peru" },
    ph: { code: "ph", name: "Philippines" },
    pn: { code: "pn", name: "Pitcairn" },
    pl: { code: "pl", name: "Poland" },
    pt: { code: "pt", name: "Portugal" },
    pr: { code: "pr", name: "Puerto Rico" },
    qa: { code: "qa", name: "Qatar" },
    re: { code: "re", name: "Reunion" },
    ro: { code: "ro", name: "Romania" },
    ru: { code: "ru", name: "Russian Federation" },
    rw: { code: "rw", name: "Rwanda" },
    sh: { code: "sh", name: "Saint Helena" },
    kn: { code: "kn", name: "Saint Kitts and Nevis" },
    lc: { code: "lc", name: "Saint Lucia" },
    pm: { code: "pm", name: "Saint Pierre and Miquelon" },
    vc: { code: "vc", name: "Saint Vincent and the Grenadines" },
    ws: { code: "ws", name: "Samoa" },
    sm: { code: "sm", name: "San Marino" },
    st: { code: "st", name: "Sao Tome and Principe" },
    sa: { code: "sa", name: "Saudi Arabia" },
    sn: { code: "sn", name: "Senegal" },
    rs: { code: "rs", name: "Serbia" },
    me: { code: "me", name: "Montenegro" },
    sc: { code: "sc", name: "Seychelles" },
    sl: { code: "sl", name: "Sierra Leone" },
    sg: { code: "sg", name: "Singapore" },
    sk: { code: "sk", name: "Slovakia" },
    si: { code: "si", name: "Slovenia" },
    sb: { code: "sb", name: "Solomon Islands" },
    so: { code: "so", name: "Somalia" },
    za: { code: "za", name: "South Africa" },
    gs: { code: "gs", name: "South Georgia and the South Sandwich Islands" },
    es: { code: "es", name: "Spain" },
    lk: { code: "lk", name: "Sri Lanka" },
    sd: { code: "sd", name: "Sudan" },
    sr: { code: "sr", name: "Suriname" },
    sj: { code: "sj", name: "Svalbard and Jan Mayen" },
    sz: { code: "sz", name: "Swaziland" },
    se: { code: "se", name: "Sweden" },
    ch: { code: "ch", name: "Switzerland" },
    sy: { code: "sy", name: "Syrian Arab Republic" },
    tw: { code: "tw", name: "Taiwan, Province of China" },
    tj: { code: "tj", name: "Tajikistan" },
    tz: { code: "tz", name: "Tanzania" },
    th: { code: "th", name: "Thailand" },
    tl: { code: "tl", name: "Timor-Leste" },
    tg: { code: "tg", name: "Togo" },
    tk: { code: "tk", name: "Tokelau" },
    to: { code: "to", name: "Tonga" },
    tt: { code: "tt", name: "Trinidad and Tobago" },
    tn: { code: "tn", name: "Tunisia" },
    tr: { code: "tr", name: "Turkey" },
    tm: { code: "tm", name: "Turkmenistan" },
    tc: { code: "tc", name: "Turks and Caicos Islands" },
    tv: { code: "tv", name: "Tuvalu" },
    ug: { code: "ug", name: "Uganda" },
    ua: { code: "ua", name: "Ukraine" },
    ae: { code: "ae", name: "United Arab Emirates" },
    gb: { code: "gb", name: "United Kingdom" },
    us: { code: "us", name: "United States" },
    um: { code: "um", name: "United States Minor Outlying Islands" },
    uy: { code: "uy", name: "Uruguay" },
    uz: { code: "uz", name: "Uzbekistan" },
    vu: { code: "vu", name: "Vanuatu" },
    ve: { code: "ve", name: "Venezuela" },
    vn: { code: "vn", name: "Viet Nam" },
    vg: { code: "vg", name: "Virgin Islands, British" },
    vi: { code: "vi", name: "Virgin Islands, U.S." },
    wf: { code: "wf", name: "Wallis and Futuna" },
    eh: { code: "eh", name: "Western Sahara" },
    ye: { code: "ye", name: "Yemen" },
    zm: { code: "zm", name: "Zambia" },
    zw: { code: "zw", name: "Zimbabwe" },
    t1: { code: "t1", name: "Tor" },
  };

  return countryStore[countryCode];
};

export const TimeToText = (value) => {
  if (value === 0) {
    return value;
  } else if (value < 60) {
    return `${value} seconds`;
  } else if (value === 60) {
    return `1 minute`;
  } else if (value === 3600) {
    return `1 hour`;
  } else if (value === 86400) {
    return `1 day`;
  } else if (value === 2678400) {
    return `1 month`;
  } else if (value >= 60 && value < 3600) {
    return `${value / 60} minutes`;
  } else if (value >= 3600 && value < 86400) {
    return `${value / 3600} hours`;
  } else if (value >= 86400 && value < 2678400) {
    return `${value / 86400} days`;
  } else if (value >= 2678400 && value < 31536000) {
    return `${value / 2678400} months`;
  } else {
    return "1 year";
  }
};

export const getZoneSetting = async (query, endpoint) => {
  const url = `https://serverless-api.ulysseskcw96.workers.dev${endpoint}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  return resp.json();
};

/**
 * Returns an array with the results of the same API call for different zones
 *
 * @param {*} zoneKeys
 * @param {*} zoneDetailsObj
 * @param {*} endpoint
 * @returns
 */
export const getMultipleZoneSettings = async (
  zoneKeys,
  zoneDetailsObj,
  endpoint
) => {
  const resp = await Promise.all(
    zoneKeys.map((key) => {
      const payload = {
        zoneId: zoneDetailsObj[key].zoneId,
        apiToken: `Bearer ${zoneDetailsObj[key].apiToken}`,
      };
      return getZoneSetting(payload, endpoint);
    })
  );
  return resp;
};

/**
 * Produces extension of headers for comparison zones
 * @param {*} len
 * @returns
 */
export const HeaderFactory = (len) => {
  let output = [];
  for (let i = 2; i <= len; i++) {
    output.push({
      Header: `Zone ${i}`,
      accessor: `zone${i}`,
      Cell: (props) =>
        props.value ? (
          <CheckIcon color={"green"} />
        ) : (
          <CloseIcon color={"red"} />
        ),
    });
  }
  return output;
};

/**
 * Compares DNS Records for any given amount of zones provided in array format and returns an array
 * @param {*} baseData
 * @param {*} restData
 * @returns
 */
export const CompareDnsRecords = (baseData, restData) => {
  if (baseData.success === true && baseData.result.length) {
    const baseZoneData = baseData.result;
    return baseZoneData.map((baseObj) => {
      for (let j = 0; j < restData.length; j++) {
        if (restData[j].success === true) {
          const currentCompareZoneData = restData[j].result;
          let foundMatch = false;
          currentCompareZoneData.forEach((compareObj) => {
            if (
              baseObj.type === compareObj.type &&
              baseObj.name === compareObj.name &&
              baseObj.content === compareObj.content &&
              baseObj.proxied === compareObj.proxied
            ) {
              foundMatch = true;
            }
            foundMatch
              ? (baseObj[`zone${j + 2}`] = true)
              : (baseObj[`zone${j + 2}`] = false);
          });
        }
      }
      return baseObj;
    });
  } else {
    // base zone is unsuccessful or has no entries
    let newObj = {
      setting: "DNS Management",
      value: false,
    };
    for (let j = 0; j < restData.length; j++) {
      restData[j].success === true && restData[j].result.length
        ? (newObj[`zone${j + 2}`] = true)
        : (newObj[`zone${j + 2}`] = false);
    }
    return [newObj];
  }
};

/**
 * Takes in a comparison function and data, and returns an array for React-Table
 * @param {*} comp_fn
 * @param {*} data
 * @returns
 */
export const compareData = (comp_fn, data) => {
  return comp_fn(data[0], data.slice(1));
};
