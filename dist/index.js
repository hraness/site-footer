// node_modules/@stylexjs/stylex/lib/es/stylex.mjs
var styleq = {};
var hasRequiredStyleq;
function requireStyleq() {
  if (hasRequiredStyleq)
    return styleq;
  hasRequiredStyleq = 1;
  Object.defineProperty(styleq, "__esModule", {
    value: true
  });
  styleq.styleq = undefined;
  var cache = new WeakMap;
  var compiledKey = "$$css";
  function createStyleq(options) {
    var disableCache;
    var disableMix;
    var transform;
    if (options != null) {
      disableCache = options.disableCache === true;
      disableMix = options.disableMix === true;
      transform = options.transform;
    }
    return function styleq2() {
      var definedProperties = [];
      var className = "";
      var inlineStyle = null;
      var debugString = "";
      var nextCache = disableCache ? null : cache;
      var styles = new Array(arguments.length);
      for (var i = 0;i < arguments.length; i++) {
        styles[i] = arguments[i];
      }
      while (styles.length > 0) {
        var possibleStyle = styles.pop();
        if (possibleStyle == null || possibleStyle === false) {
          continue;
        }
        if (Array.isArray(possibleStyle)) {
          for (var _i = 0;_i < possibleStyle.length; _i++) {
            styles.push(possibleStyle[_i]);
          }
          continue;
        }
        var style = transform != null ? transform(possibleStyle) : possibleStyle;
        if (style.$$css != null) {
          var classNameChunk = "";
          if (nextCache != null && nextCache.has(style)) {
            var cacheEntry = nextCache.get(style);
            if (cacheEntry != null) {
              classNameChunk = cacheEntry[0];
              debugString = cacheEntry[2];
              definedProperties.push.apply(definedProperties, cacheEntry[1]);
              nextCache = cacheEntry[3];
            }
          } else {
            var definedPropertiesChunk = [];
            for (var prop in style) {
              var value = style[prop];
              if (prop === compiledKey) {
                var compiledKeyValue = style[prop];
                if (compiledKeyValue !== true) {
                  debugString = debugString ? compiledKeyValue + "; " + debugString : compiledKeyValue;
                }
                continue;
              }
              if (typeof value === "string" || value === null) {
                if (!definedProperties.includes(prop)) {
                  definedProperties.push(prop);
                  if (nextCache != null) {
                    definedPropertiesChunk.push(prop);
                  }
                  if (typeof value === "string") {
                    classNameChunk += classNameChunk ? " " + value : value;
                  }
                }
              } else {
                console.error("styleq: ".concat(prop, " typeof ").concat(String(value), ' is not "string" or "null".'));
              }
            }
            if (nextCache != null) {
              var weakMap = new WeakMap;
              nextCache.set(style, [classNameChunk, definedPropertiesChunk, debugString, weakMap]);
              nextCache = weakMap;
            }
          }
          if (classNameChunk) {
            className = className ? classNameChunk + " " + className : classNameChunk;
          }
        } else {
          if (disableMix) {
            if (inlineStyle == null) {
              inlineStyle = {};
            }
            inlineStyle = Object.assign({}, style, inlineStyle);
          } else {
            var subStyle = null;
            for (var _prop in style) {
              var _value = style[_prop];
              if (_value !== undefined) {
                if (!definedProperties.includes(_prop)) {
                  if (_value != null) {
                    if (inlineStyle == null) {
                      inlineStyle = {};
                    }
                    if (subStyle == null) {
                      subStyle = {};
                    }
                    subStyle[_prop] = _value;
                  }
                  definedProperties.push(_prop);
                  nextCache = null;
                }
              }
            }
            if (subStyle != null) {
              inlineStyle = Object.assign(subStyle, inlineStyle);
            }
          }
        }
      }
      var styleProps = [className, inlineStyle, debugString];
      return styleProps;
    };
  }
  var styleq$1 = styleq.styleq = createStyleq();
  styleq$1.factory = createStyleq;
  return styleq;
}
var styleqExports = /* @__PURE__ */ requireStyleq();
function props(...styles) {
  const [className, style, dataStyleSrc] = styleqExports.styleq(styles);
  const result = {};
  if (className != null && className !== "") {
    result.className = className;
  }
  if (style != null && Object.keys(style).length > 0) {
    result.style = style;
  }
  if (dataStyleSrc != null && dataStyleSrc !== "") {
    result["data-style-src"] = dataStyleSrc;
  }
  return result;
}
var env = Object.freeze({});

// src/footer.stylex.ts
var holographicSurface = "var(--hraness-site-footer-holo-surface, var(--hraness-foil-surface, var(--hraness-site-footer-background)))";
var holographicBackgroundImage = "linear-gradient(" + holographicSurface + ", " + holographicSurface + "), radial-gradient(ellipse 28% 100% at var(--hraness-foil-x, 50%) var(--hraness-foil-y, 50%), color-mix(in srgb, white calc(60% + var(--hraness-foil-glow, 0) * 24%), transparent) 0%, transparent 72%), radial-gradient(ellipse 80% 180% at calc(100% - var(--hraness-foil-x, 50%)) calc(100% - var(--hraness-foil-y, 50%)), color-mix(in srgb, white 28%, transparent) 0%, transparent 78%), linear-gradient(115deg, var(--_hraness-foil-1), var(--_hraness-foil-2), var(--_hraness-foil-3), var(--_hraness-foil-4), var(--_hraness-foil-5), var(--_hraness-foil-6))";
var styles = {
  root: {
    "--hraness-site-footer-foreground": "x1ktp55a",
    "--hraness-site-footer-muted": "x8d9m59",
    "--hraness-site-footer-line": "x96ybla",
    "--hraness-site-footer-focus": "x14z8vex",
    "--hraness-site-footer-background": "x8c10za",
    "--hraness-site-footer-action-background": "xdg0xw2",
    "--hraness-site-footer-action-foreground": "x1munjs5",
    "--hraness-site-footer-field-background": "xsctza4",
    "--hraness-site-footer-social-target": "xtq98z5 x1w6jg7m",
    "--hraness-site-footer-socials-inline-size": "x3luoqq",
    "--hraness-site-footer-control-block-size": "x1xgbxbt x9cmhvv",
    "--hraness-site-footer-status-block-size": "x4sry57",
    "--hraness-site-footer-form-block-size": "xys6ka6",
    "--hraness-site-footer-row-gap": "x1d4g2j8",
    "--hraness-site-footer-mailing-overlay-clearance": "x1sphz0r",
    "--hraness-site-footer-padding-block": "x19y8ktx",
    "--hraness-site-footer-mailing-overlay-offset": "x1h47zgc",
    "--hraness-site-footer-content-block-size": "x1ghcxmq",
    "--hraness-site-footer-bar-block-size": "xe0js8b",
    kULEZF: "xiuoait",
    kMwMTN: "x1g4142m",
    kMv6JI: "xprmc4t",
    kGuDYH: "xkpwil5",
    $$css: true
  },
  signup: {
    "--hraness-site-footer-content-block-size": "x1o9lycj",
    "--hraness-site-footer-mailing-overlay-clearance": "xma658k",
    $$css: true
  },
  stickyFootprint: {
    kVQ08L: "x5vl0wm",
    $$css: true
  },
  stickyBar: {
    kVAEAm: "xixxii4",
    khdm6U: "x17y0mx6",
    kctUWg: "xuufnwz",
    kY2c9j: "xf5e64p",
    $$css: true
  },
  green: {
    "--hraness-site-footer-action-background": "x3l4yik",
    "--hraness-site-footer-action-foreground": "x1izjwho",
    $$css: true
  },
  orange: {
    "--hraness-site-footer-action-background": "x1mq49gw",
    "--hraness-site-footer-action-foreground": "x1lf6uaq",
    $$css: true
  },
  blue: {
    "--hraness-site-footer-action-background": "x18vkaze",
    "--hraness-site-footer-action-foreground": "x1e6emja",
    $$css: true
  },
  disclosure: {
    kVAEAm: "x1uhb9sk",
    kJuA4N: "x1qaspin",
    kdYMnH: "xesnm00",
    k2kXS: "x1n9s1zj",
    $$css: true
  },
  dialog: {
    kVAEAm: "x10l6tqk x3g7vmf",
    kUvb1J: "x92d9gd x1t8win8",
    kctUWg: "x1smivkc x502hvl",
    khdm6U: "x17y0mx6",
    kogj98: "x1bpp3o7",
    kULEZF: "x1y56ywe",
    k2kXS: "x1ljtl1n",
    kLO5vc: "x1pzgvly",
    kORKVm: "x1odjw0f",
    kZeWKH: "xish69e",
    kZ7BSC: "x185mbhu",
    kF3gjK: "xrfbana",
    kJVvJu: "xk5lw23",
    kMzoRj: "xc342km",
    kaIpWk: "x3fmiap",
    kWkggS: "x1hhhz6w x16vqh2n",
    kMwMTN: "x1g4142m",
    kGVxlE: "x165lju9",
    kMv6JI: "xjb2p0i",
    kGuDYH: "x1jchvi3",
    kLWn49: "x1evy7pa",
    $$css: true
  },
  dialogHeader: {
    k1xSpc: "x78zum5",
    kGNEyG: "x7a106z",
    kOIVth: "x8fetqu",
    kjj79g: "x1qughib",
    $$css: true
  },
  dialogTitle: {
    kogj98: "x1ghz6dp",
    kGuDYH: "xngnso2",
    k63SB2: "x19s9jnd",
    kLWn49: "x1u7k74",
    kN2L0X: "x1w2vvpw",
    $$css: true
  },
  dialogDescription: {
    keoZOQ: "xhj8ucd",
    k1K539: "x1nhhxel",
    kGuDYH: "x1jchvi3",
    kLWn49: "x1evy7pa",
    $$css: true
  },
  dialogClose: {
    k1xSpc: "x3nfvp2 xvgho8r",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kmuXW: "x2lah0s",
    kULEZF: "x1nwd19c",
    kLWsYc: "x18h55qy",
    keoZOQ: "x1bov10x",
    k71WvV: "x1dpfygs",
    kMzoRj: "xc342km",
    kaIpWk: "x6i6fhv",
    kWkggS: "xjbqb8w xgqpex1",
    kMwMTN: "x1heor9g",
    kkrTdU: "x1ypdohk",
    $$css: true
  },
  emailLabel: {
    k1xSpc: "x1lliihq",
    k1K539: "xhbfen4",
    kGuDYH: "x6u19be",
    k63SB2: "x1s688f",
    $$css: true
  },
  disclosureTrigger: {
    kkrTdU: "x1ypdohk",
    k63SB2: "x1s688f",
    kH6xsr: "x3ct3a4",
    kULEZF: "x6n8wx1",
    k2kXS: "xgyk9h7",
    kaIpWk: "x6i6fhv",
    kImiAN: "x1lziwak",
    kGuDYH: "xboafo0 x7odbza",
    khDVqt: "xuxw1ft",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    kJVvJu: "xvpgqt4",
    kF3gjK: "xt970qd",
    k1xSpc: "x78zum5 x1i5lizr",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kLWn49: "x1u7k74",
    kKwaWg: "xq9wfvg xhobzj1",
    kVAM5u: "x9r1u3d x1ylmb6m",
    kMwMTN: "x1g4142m",
    $$css: true
  },
  disclosureLabel: {
    k1xSpc: "x1lliihq",
    kdYMnH: "xesnm00",
    kVQacm: "xb3r6kr",
    khDVqt: "xuxw1ft",
    kg5iWk: "xlyipyv",
    $$css: true
  },
  triggerClosed: {
    kJuA4N: "xxwd7sb",
    k33iCy: "xnpuxes x12yxz85",
    $$css: true
  },
  triggerOpen: {
    kJuA4N: "xxwd7sb",
    k63SB2: "xk50ysn",
    k33iCy: "xlshs6z x16dnoq8",
    $$css: true
  },
  disclosurePanel: {
    kVAEAm: "x10l6tqk",
    kctUWg: "xr04doy x12aoker",
    ka7YqC: "xe89of6 x1vbotui",
    kULEZF: "xzm6ek",
    k2kXS: "x1ljtl1n",
    kF3gjK: "x18g2hj5",
    kJVvJu: "x97vtpp",
    kaIpWk: "x116uinm",
    kY2c9j: "xzkaem6",
    kWkggS: "x1hhhz6w",
    $$css: true
  },
  holographic: {
    "--_hraness-foil-1": "x35j2r9 x1dscx4y",
    "--_hraness-foil-2": "xmntjkq x14xjb22",
    "--_hraness-foil-3": "x1xbl91z x1iiaa4z",
    "--_hraness-foil-4": "x47qxf1 x1n6b76k",
    "--_hraness-foil-5": "x13hwd88 x1z0t8xj",
    "--_hraness-foil-6": "xx7v8hi x1bbyikp",
    "--hraness-foil-glow": "x136ldfs x1a9zcsi",
    kMzoRj: "xdh2fpr",
    kVAM5u: "x9r1u3d x1ylmb6m",
    kWkggS: "x1bvqrnj",
    kMwMTN: "x1g4142m",
    kKwaWg: "xq9wfvg xhobzj1",
    kl9DO0: "x1gqfdwy",
    kHypHr: "x123zpmm",
    kGVxlE: "x1kyqxw3 xwaqzdf",
    $$css: true
  },
  compactConfirmation: {
    kGuDYH: "xboafo0",
    kVQacm: "xb3r6kr",
    khDVqt: "xuxw1ft",
    kg5iWk: "xlyipyv",
    $$css: true
  },
  shimmer: {
    "--hraness-site-footer-shimmer-spread": "x94vt28",
    kKVMdj: "x1n2piig xal2be3",
    k44tkh: "x1c74tu6",
    kyAemX: "x1esw782",
    ko0y90: "xa4qsjk",
    kKwaWg: "x1hhrnal xhobzj1",
    k1YJky: "x1eror2x",
    kz484i: "xiy17q3",
    kgSjnq: "x18g1bdp",
    kHypHr: "x1ta4xzc",
    kUisrP: "x1urst0s x1wouot0 x1g58opa",
    $$css: true
  },
  box: {
    kB7OPa: "x9f619",
    $$css: true
  },
  backgroundReset: {
    kKwaWg: "x18o3ruo",
    k1YJky: "x1y4qj14",
    kgSjnq: "x1cwfr1t",
    kz484i: "x182nak8",
    kl9DO0: "x12koezg",
    kHypHr: "x1u7o2vf",
    ku1ltF: "x1fdtg7e",
    $$css: true
  },
  border: {
    kMzoRj: "xmkeg23",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x11ngh50 x1ylmb6m",
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    $$css: true
  },
  focus: {
    kMeerF: "x784prv",
    k3XXqK: "x9v5kkp",
    kjBf7l: "xxuwnm0 xz4eswf",
    kInvED: "xj3ae5l",
    $$css: true
  },
  focusInset: {
    kMeerF: "x784prv",
    k3XXqK: "x9v5kkp",
    kjBf7l: "xxuwnm0 xz4eswf",
    kInvED: "xhfxdjs",
    $$css: true
  },
  motion: {
    k1ekBW: "x105zyf9",
    kIyJzY: "x1ntgrh1",
    kAMwcw: "xma2t0n",
    kIr0Dl: "x7ctuma",
    $$css: true
  },
  inner: {
    kanfag: "x12e8u3k",
    k9g6sI: "x12h1iku",
    kVAEAm: "x1n2onr6",
    k1xSpc: "xrvj5dj",
    kC13JO: "x182hbjg x196kgno",
    kumcoG: "x1rkzygb x1qs5i8y",
    k9llMU: "xv7uhgh",
    kULEZF: "xiuoait",
    kLWsYc: "xzlj3eo",
    kVQ08L: "x5vl0wm",
    k2kXS: "x1tec7hu",
    kdYMnH: "xesnm00",
    kfiyM8: "xc26acl",
    kGNEyG: "x6s0dn4",
    k1C7PZ: "x1n78d84",
    khm7nJ: "x1lfezxm",
    kT8eP4: "x1b1eqt9",
    kmc9e2: "x3so8kt",
    kpvK8V: "x1gz0dqr x1np48w9",
    kWkggS: "x1hhhz6w x9yvj25",
    kS5dFF: "x1bhgv95",
    kgDt7k: "xpcvst1",
    kzfwIZ: "x1i0wikq",
    kO8tuG: "xs8f16d",
    $$css: true
  },
  innerSignup: {
    kC13JO: "x1m6ayzh x12d2mci",
    kumcoG: "xo69rmz x1t3gk10",
    k9llMU: "x42z6zh",
    $$css: true
  },
  innerAccount: {
    kC13JO: "x1m6ayzh x12d2mci",
    kumcoG: "xo69rmz x1t3gk10",
    $$css: true
  },
  innerNoBrand: {
    kC13JO: "x14deco2 x1ovmjtf",
    kumcoG: "x1mkdm3x xh9f616",
    $$css: true
  },
  innerMailingNoBrand: {
    kC13JO: "x1e1zwiu x1s2ae5y",
    kumcoG: "x1olarsd x1xd8dcn",
    $$css: true
  },
  innerSupportNoBrand: {
    kC13JO: "x1rpbaqk x1r7kgav",
    kumcoG: "x5o1nov x1qs5i8y",
    $$css: true
  },
  innerMailingSupportNoBrand: {
    kC13JO: "x1cbzbnn xydvb3f",
    kumcoG: "x1nrjx37 x1g8uo05",
    $$css: true
  },
  account: {
    kJuA4N: "x1qaspin",
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kdYMnH: "xesnm00",
    k2kXS: "xmk4v7v",
    kJVvJu: "xvpgqt4",
    kaIpWk: "x6i6fhv",
    kMwMTN: "xj5idha",
    kGuDYH: "x1dcheo9",
    k63SB2: "xk50ysn",
    kLWn49: "xo5v014",
    kybGjl: "x1hl2dhg",
    khDVqt: "xuxw1ft",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    $$css: true
  },
  innerSupport: {
    kC13JO: "x7p9kbz xa4jtz2",
    kumcoG: "x170cel8 x1yi829s",
    $$css: true
  },
  innerSignupSupport: {
    kC13JO: "x1y8t5ps x11qbbop",
    kumcoG: "x186f4cn xzi2blw",
    $$css: true
  },
  innerAccountSupport: {
    kC13JO: "x1y8t5ps x11qbbop",
    kumcoG: "x186f4cn xzi2blw",
    $$css: true
  },
  support: {
    kJuA4N: "x2ga2k1",
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kjj79g: "xl56j7k",
    kULEZF: "x175cv4s",
    kLWsYc: "x1bxml6c",
    kdYMnH: "xesnm00",
    kVQ08L: "x159srwy",
    kaIpWk: "x1e6avla",
    kMwMTN: "xj5idha xxeg0yr",
    kWkggS: "x1voprv7",
    kVAM5u: "x1ylmb6m",
    kybGjl: "x1hl2dhg",
    $$css: true
  },
  flexCenter: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    $$css: true
  },
  fixedFlex: {
    kzQI83: "x1c4vz4f",
    kmuXW: "x2lah0s",
    kCS8Yb: "xdl72j9",
    $$css: true
  },
  brand: {
    kJuA4N: "x1pmbb8p",
    kSGwAc: "xamitd3",
    kjj79g: "xl56j7k",
    kdYMnH: "xart1r9",
    kVQ08L: "xeuuy2l",
    kaIpWk: "x6i6fhv",
    k1C7PZ: "x1d3i0y6",
    kMwMTN: "x1heor9g xxeg0yr",
    k63SB2: "x19s9jnd",
    kb6lSQ: "x130jcwj",
    kLWn49: "xo5v014",
    kybGjl: "x1hl2dhg",
    $$css: true
  },
  brandName: {
    kMwMTN: "xj5idha",
    kGuDYH: "x1dcheo9",
    k63SB2: "xk50ysn",
    kb6lSQ: "x1i21sxh",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  mark: {
    kULEZF: "xif76xs",
    kLWsYc: "x1wugil3",
    $$css: true
  },
  links: {
    kJuA4N: "xt33hwp",
    kanfag: "xgc5ccc",
    k9g6sI: "x12h1iku",
    kULEZF: "xiuoait",
    kdYMnH: "xesnm00",
    kjj79g: "x13a6bvl",
    kImiAN: "xvc5jky",
    $$css: true
  },
  socials: {
    k1xSpc: "x78zum5",
    kdYMnH: "xesnm00",
    kjj79g: "x13a6bvl",
    kOIVth: "x1enigpx",
    kogj98: "x1ghz6dp",
    kmVPX3: "x1717udv",
    kH6xsr: "x3ct3a4",
    kpqbRz: "x43c9pm",
    khnUzm: "xnbnhf8",
    $$css: true
  },
  socialItem: {
    kULEZF: "x175cv4s",
    kLWsYc: "x1bxml6c",
    kzQI83: "x1c4vz4f",
    kmuXW: "x2lah0s",
    kCS8Yb: "x4hbtdw",
    kdYMnH: "xesnm00",
    kVQ08L: "x159srwy",
    $$css: true
  },
  socialAlways: {
    k1xSpc: "x1lliihq",
    $$css: true
  },
  socialSecond: {
    k1xSpc: "x1s85apg xhzsqoz x6w72mi",
    $$css: true
  },
  socialThird: {
    k1xSpc: "x1s85apg x18g50z5 x101cbvv",
    $$css: true
  },
  socialFourth: {
    k1xSpc: "x1s85apg xir82yx xwl02xf",
    $$css: true
  },
  socialLink: {
    kULEZF: "xiuoait",
    kLWsYc: "xuxy95z",
    kjj79g: "xl56j7k",
    kaIpWk: "x1e6avla",
    kMwMTN: "xj5idha xxeg0yr",
    kWkggS: "x1voprv7",
    kKwaWg: "x8o3jvd",
    k1YJky: "xwt2121",
    kgSjnq: "x1f6hyc3",
    kz484i: "x1x226zn",
    kl9DO0: "xsq4hlx",
    kHypHr: "x156efcn",
    ku1ltF: "xlkrsup",
    kVAM5u: "x1ylmb6m",
    kybGjl: "x1hl2dhg",
    $$css: true
  },
  socialIcon: {
    kULEZF: "x1milg1j",
    kLWsYc: "x38bysi",
    $$css: true
  },
  consent: {
    kVAEAm: "x10l6tqk x18obxus",
    kctUWg: "x1smivkc x1cd001l",
    k7w2rI: "x1fmyei2",
    kWkggS: "x1hhhz6w",
    kEXP64: "xcrlgei xax01ff",
    kWZpDQ: "xx1abn8 xr0yb7",
    k1lYIM: "x1i433cm",
    kpJH7q: "x1qh7fzj",
    kSGwAc: "xamitd3",
    kFhvOy: "x1qab1bc",
    kdYMnH: "xesnm00",
    kMwMTN: "xj5idha",
    kGuDYH: "x1dcheo9",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  consentAccept: {
    kmVPX3: "x1717udv",
    kMzoRj: "xc342km",
    kWkggS: "xjbqb8w",
    kkrTdU: "x1ypdohk",
    kMwMTN: "x1g4142m",
    k63SB2: "xh88oxj",
    kybGjl: "x1hl2dhg x4ohgrr",
    $$css: true
  },
  consentSeparator: {
    kYk0Dm: "x82nc2q",
    $$css: true
  },
  consentMore: {
    k1xSpc: "xt0psk2",
    kVAEAm: "x1n2onr6",
    $$css: true
  },
  consentLearn: {
    kkrTdU: "x1ypdohk",
    k1xSpc: "xt0psk2 x1i5lizr",
    kH6xsr: "x3ct3a4",
    keTefX: "x1lziwak",
    kybGjl: "x1hl2dhg x4ohgrr",
    $$css: true
  },
  consentPanel: {
    kVAEAm: "x10l6tqk",
    kY2c9j: "xhtitgo",
    kctUWg: "x1byf6of",
    k7w2rI: "xtijo5x",
    kULEZF: "x146urod",
    k2kXS: "x1ljtl1n",
    kF3gjK: "x13eudtd",
    kJVvJu: "x1ryrjj2",
    kaIpWk: "x116uinm",
    kWkggS: "x1hhhz6w x9yvj25",
    kMwMTN: "xj5idha",
    kGuDYH: "x1dcheo9",
    kLWn49: "xfrs9s4",
    khDVqt: "xeaf4i8",
    $$css: true
  },
  consentLink: {
    kMwMTN: "x1g4142m",
    $$css: true
  },
  mailingGeometry: {
    kJuA4N: "x1qaspin",
    kULEZF: "xgybh9h",
    kdYMnH: "xesnm00",
    kLWsYc: "x1dmgvpn",
    kogj98: "x1ghz6dp",
    $$css: true
  },
  mailing: {
    kVAEAm: "x1n2onr6",
    k1xSpc: "x1lliihq xvgho8r",
    kogj98: "x1ghz6dp",
    kULEZF: "xiuoait",
    $$css: true
  },
  mailingControls: {
    k1xSpc: "xrvj5dj",
    kOIVth: "x8fetqu",
    kdYMnH: "xesnm00",
    $$css: true
  },
  mailingLabel: {
    k1xSpc: "x1lliihq",
    kdYMnH: "xesnm00",
    kzQI83: "x1iyjqo2",
    kmuXW: "xs83m0k",
    kCS8Yb: "xdl72j9",
    $$css: true
  },
  control: {
    kLWsYc: "xlashs9",
    kMv6JI: "xjb2p0i",
    kGuDYH: "x1qlqyl8",
    kKX8nH: "x1t35e8",
    kjAs5C: "x1aazh3f",
    k63SB2: "x1pd3egz",
    kQqvRs: "x1xh6y1q",
    kLWn49: "x15bjb6t",
    kC21eY: "xd4aj15",
    krGR0G: "xvmqkbn",
    kV0H8L: "x10rt0pk",
    kqBzK6: "x1rcybi7",
    kHiXq7: "x61gc8y",
    ka26j: "xkyhvkk",
    $$css: true
  },
  mailingInput: {
    kULEZF: "xiuoait",
    kdYMnH: "xesnm00",
    kVQ08L: "x1ouqbbl",
    kGuDYH: "xgt9wab",
    kaIpWk: "x116uinm",
    kWkggS: "xo5clpu",
    kMwMTN: "x1g4142m xook0zr",
    knGrYV: "x91417p",
    kSiTet: "x7xwk5j",
    kJVvJu: "x13s4r1c",
    $$css: true
  },
  mailingSubmit: {
    kGNEyG: "x6s0dn4",
    k1xSpc: "x3nfvp2",
    kjj79g: "xl56j7k",
    kLWn49: "x1u7k74",
    kaIpWk: "x116uinm",
    kVQ08L: "x1ouqbbl",
    kULEZF: "xiuoait",
    kWkggS: "x1ujht2g x1tt9vl1",
    kMwMTN: "xaazplj x1q5838n",
    kkrTdU: "x1ypdohk xjb0foi",
    kSiTet: "xo3u330",
    k63SB2: "x19s9jnd",
    kGuDYH: "x1jchvi3",
    kJVvJu: "x13s4r1c",
    k9WMMc: "x2b8uid",
    $$css: true
  },
  mailingStatus: {
    keoZOQ: "xj1urod",
    k1K539: "xat24cr",
    kdYMnH: "xesnm00",
    kmVPX3: "x1717udv",
    kMwMTN: "x1g4142m",
    kGuDYH: "x1jchvi3",
    kLWn49: "x1evy7pa",
    k1xSpc: "x1s85apg",
    khDVqt: "xeaf4i8",
    kHjlTd: "xj0a0fe",
    $$css: true
  },
  statusVisible: {
    k1xSpc: "x1lliihq",
    $$css: true
  },
  statusError: {
    kMwMTN: "x1g4142m",
    $$css: true
  },
  mailingConfirmation: {
    kaIpWk: "x6i6fhv",
    kWkggS: "xo5clpu",
    kMwMTN: "x1g4142m",
    k63SB2: "xh88oxj",
    kJVvJu: "x1ryrjj2",
    $$css: true
  },
  visuallyHidden: {
    kVAEAm: "x10l6tqk",
    kVQacm: "xb3r6kr",
    kULEZF: "xi8173g",
    kLWsYc: "xpoyz9m",
    kogj98: "xkdpibf",
    kmVPX3: "x1717udv",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    kVAM5u: "x1r7ld26",
    kawU7v: "x18sabzy",
    k5BUTg: "x1jleocg",
    kqOd84: "x1pjjote",
    kzPi7L: "x1e53mt7",
    kEz803: "xgkqhyc",
    kMcinP: "xeh89do",
    kz4h6p: "x1hyvwdk",
    khDVqt: "xuxw1ft",
    $$css: true
  }
};
function className(hook, ...recipes) {
  return `${hook} ${props(...recipes).className ?? ""}`.trim();
}
var footerClasses = {
  account: className("hraness-site-footer__account", styles.box, styles.backgroundReset, styles.border, styles.control, styles.account, styles.focusInset),
  support: className("hraness-site-footer__support", styles.box, styles.support, styles.focus, styles.motion),
  supportIcon: className("hraness-site-footer__support-icon", styles.socialIcon),
  disclosure: `${className("hraness-site-footer__disclosure", styles.disclosure)} ${{
    className: "x1gmlqhs"
  }.className}`,
  disclosureTrigger: className("hraness-site-footer__disclosure-trigger", styles.box, styles.border, styles.control, styles.holographic, styles.disclosureTrigger, styles.focusInset, styles.motion),
  disclosureLabel: className("hraness-site-footer__disclosure-label", styles.disclosureLabel),
  triggerClosed: className("hraness-site-footer__disclosure-closed-label", styles.triggerClosed),
  triggerOpen: className("hraness-site-footer__disclosure-open-label", styles.triggerOpen),
  disclosurePanel: className("hraness-site-footer__disclosure-panel", styles.box, styles.border, styles.disclosurePanel),
  dialog: className("hraness-site-footer__dialog", styles.box, styles.dialog),
  dialogHeader: className("hraness-site-footer__dialog-header", styles.dialogHeader),
  dialogTitle: className("hraness-site-footer__dialog-title", styles.dialogTitle),
  dialogDescription: className("hraness-site-footer__dialog-description", styles.dialogDescription),
  dialogClose: className("hraness-site-footer__dialog-close", styles.box, styles.dialogClose, styles.focusInset),
  emailLabel: className("hraness-site-footer__email-label", styles.emailLabel),
  shimmer: className("hraness-site-footer__shimmer", styles.shimmer),
  brand: className("hraness-site-footer__brand", styles.flexCenter, styles.fixedFlex, styles.brand, styles.focus, styles.motion),
  brandName: className("hraness-site-footer__brand-name", styles.brandName),
  mark: className("hraness-site-footer__mark", styles.fixedFlex, styles.mark),
  links: className("hraness-site-footer__links", styles.flexCenter, styles.links),
  socials: className("hraness-site-footer__socials", styles.socials),
  socialLink: className("hraness-site-footer__social-link", styles.flexCenter, styles.fixedFlex, styles.socialLink, styles.focus, styles.motion),
  socialIcon: className("hraness-site-footer__social-icon", styles.socialIcon),
  consent: className("hraness-site-footer__consent", styles.box, styles.consent),
  consentAccept: className("hraness-site-footer__consent-accept", styles.box, styles.backgroundReset, styles.border, styles.control, styles.consentAccept, styles.focus, styles.motion),
  consentSeparator: className("hraness-site-footer__consent-separator", styles.consentSeparator),
  consentMore: className("hraness-site-footer__consent-more", styles.consentMore),
  consentLearn: className("hraness-site-footer__consent-learn", styles.consentLearn, styles.focus, styles.motion),
  consentPanel: className("hraness-site-footer__consent-panel", styles.box, styles.border, styles.consentPanel),
  consentLink: className("hraness-site-footer__consent-link", styles.consentLink, styles.focus, styles.motion),
  mailing: className("hraness-site-footer__mailing", styles.box, styles.mailing),
  honeypot: className("hraness-site-footer__honeypot", styles.visuallyHidden),
  mailingControls: className("hraness-site-footer__mailing-controls", styles.box, styles.mailingControls),
  mailingLabel: className("hraness-site-footer__mailing-label", styles.box, styles.mailingLabel),
  mailingInput: className("hraness-site-footer__mailing-input", styles.box, styles.backgroundReset, styles.border, styles.control, styles.mailingInput, styles.focusInset),
  mailingSubmit: className("hraness-site-footer__mailing-submit", styles.box, styles.backgroundReset, styles.border, styles.control, styles.fixedFlex, styles.mailingSubmit, styles.holographic, styles.focusInset, styles.motion),
  mailingConfirmation: className("hraness-site-footer__mailing-confirmation", styles.box, styles.backgroundReset, styles.border, styles.mailingGeometry, styles.flexCenter, styles.mailingConfirmation, styles.compactConfirmation, styles.focusInset),
  visuallyHidden: className("hraness-site-footer__visually-hidden", styles.visuallyHidden)
};
function footerClassName(signup, sticky = true) {
  return `${className("hraness-site-footer", styles.root, signup && styles.signup, sticky && styles.stickyFootprint)} ${{
    className: "x12mkk0b"
  }.className}`;
}
function footerInnerClassName(signup, sticky = true, color = "green", account = false, support = false, showBrand = true) {
  const colorStyle = color === "orange" ? styles.orange : color === "blue" ? styles.blue : styles.green;
  return className("hraness-site-footer__inner", styles.box, styles.backgroundReset, styles.inner, signup && styles.innerSignup, account && styles.innerAccount, support && styles.innerSupport, support && signup && styles.innerSignupSupport, support && account && styles.innerAccountSupport, !showBrand && styles.innerNoBrand, !showBrand && (signup || account) && styles.innerMailingNoBrand, !showBrand && support && styles.innerSupportNoBrand, !showBrand && support && (signup || account) && styles.innerMailingSupportNoBrand, sticky && styles.stickyBar, signup && colorStyle);
}
function socialItemClassName(index = 0) {
  return className("hraness-site-footer__social-item", styles.socialItem, index === 1 ? styles.socialSecond : index === 2 ? styles.socialThird : index === 3 ? styles.socialFourth : styles.socialAlways);
}
function mailingStatusClassName(state) {
  return className("hraness-site-footer__mailing-status", styles.box, styles.mailingStatus, styles.focusInset, state !== "idle" && styles.statusVisible, state === "error" && styles.statusError);
}
function disclosureClassNames(_layout) {
  return {
    root: footerClasses.disclosure,
    trigger: footerClasses.disclosureTrigger,
    panel: footerClasses.disclosurePanel
  };
}

// src/locales.ts
var FOOTER_COPY_STYLES = ["direct", "inviting", "goblin", "cosmic", "chaos", "secret"];
var ENGLISH_FOOTER_COPY = Object.freeze({
  direct: {
    button: "Send me things",
    placeholder: "sjobs@apple.com"
  },
  inviting: {
    button: "I'm curious",
    placeholder: "billg@microsoft.com"
  },
  goblin: {
    button: "Feed the goblin",
    placeholder: "chunkylover53@aol.com"
  },
  cosmic: {
    button: "Beam me up",
    placeholder: "tom@myspace.com"
  },
  chaos: {
    button: "Push the button",
    placeholder: "neo@metacortex.com"
  },
  secret: {
    button: "Let me in",
    placeholder: "satoshin@gmx.com"
  }
});
function isFooterCopyStyle(value) {
  return typeof value === "string" && FOOTER_COPY_STYLES.includes(value);
}
var sharedMessages = {
  en: {
    formLabel: "Subscribe by email",
    pending: "Subscribing…",
    submitting: "Submitting your email…",
    requestError: "Couldn't subscribe. Try again.",
    accepted: "Check your email for a confirmation link.",
    openLabel: "Subscribe by email",
    closeLabel: "Close email signup",
    invalidEmail: "Enter a valid email address."
  },
  es: {
    formLabel: "Recibir novedades por correo",
    pending: "Enviando…",
    submitting: "Enviando…",
    requestError: "Algo salió mal. Inténtalo de nuevo.",
    accepted: "Solicitud recibida. Revisa tu correo para continuar.",
    openLabel: "Recibir novedades por correo",
    closeLabel: "Cerrar",
    invalidEmail: "Escribe un correo electrónico válido."
  },
  "es-AR": {
    formLabel: "Recibir novedades por correo",
    pending: "Enviando…",
    submitting: "Enviando…",
    requestError: "Algo salió mal. Intentá de nuevo.",
    accepted: "Recibimos tu solicitud. Revisá tu correo para continuar.",
    openLabel: "Recibir novedades por correo",
    closeLabel: "Cerrar",
    invalidEmail: "Escribí un correo electrónico válido."
  },
  fr: {
    formLabel: "Recevoir les nouveautés par e-mail",
    pending: "Envoi…",
    submitting: "Envoi…",
    requestError: "Un problème est survenu. Réessayez.",
    accepted: "Demande reçue. Consultez votre e-mail pour la suite.",
    openLabel: "Recevoir les nouveautés par e-mail",
    closeLabel: "Fermer",
    invalidEmail: "Saisissez une adresse e-mail valide."
  },
  "fr-CA": {
    formLabel: "Recevoir les nouvelles par courriel",
    pending: "Envoi…",
    submitting: "Envoi…",
    requestError: "Un problème est survenu. Réessayez.",
    accepted: "Demande reçue. Consultez votre courriel pour la suite.",
    openLabel: "Recevoir les nouvelles par courriel",
    closeLabel: "Fermer",
    invalidEmail: "Saisissez une adresse courriel valide."
  },
  "pt-BR": {
    formLabel: "Receber novidades por e-mail",
    pending: "Enviando…",
    submitting: "Enviando…",
    requestError: "Algo deu errado. Tente novamente.",
    accepted: "Recebemos seu pedido. Confira seu e-mail para continuar.",
    openLabel: "Receber novidades por e-mail",
    closeLabel: "Fechar",
    invalidEmail: "Digite um e-mail válido."
  },
  "pt-PT": {
    formLabel: "Receber novidades por e-mail",
    pending: "A enviar…",
    submitting: "A enviar…",
    requestError: "Ocorreu um erro. Tente novamente.",
    accepted: "Pedido recebido. Consulte o seu e-mail para continuar.",
    openLabel: "Receber novidades por e-mail",
    closeLabel: "Fechar",
    invalidEmail: "Introduza um e-mail válido."
  },
  de: {
    formLabel: "Neuigkeiten per E-Mail abonnieren",
    pending: "Wird gesendet…",
    submitting: "Wird gesendet…",
    requestError: "Etwas ist schiefgelaufen. Versuch es noch einmal.",
    accepted: "Anfrage erhalten. Schau für den nächsten Schritt in deine E-Mails.",
    openLabel: "Neuigkeiten per E-Mail abonnieren",
    closeLabel: "Schließen",
    invalidEmail: "Gib eine gültige E-Mail-Adresse ein."
  },
  nl: {
    formLabel: "Nieuws ontvangen per e-mail",
    pending: "Verzenden…",
    submitting: "Verzenden…",
    requestError: "Er ging iets mis. Probeer het opnieuw.",
    accepted: "Aanvraag ontvangen. Bekijk je e-mail voor de volgende stap.",
    openLabel: "Nieuws ontvangen per e-mail",
    closeLabel: "Sluiten",
    invalidEmail: "Vul een geldig e-mailadres in."
  },
  it: {
    formLabel: "Ricevere le novità via email",
    pending: "Invio…",
    submitting: "Invio…",
    requestError: "Qualcosa è andato storto. Riprova.",
    accepted: "Richiesta ricevuta. Controlla la tua email per continuare.",
    openLabel: "Ricevere le novità via email",
    closeLabel: "Chiudi",
    invalidEmail: "Inserisci un indirizzo email valido."
  },
  ca: {
    formLabel: "Rebre novetats per correu",
    pending: "Enviant…",
    submitting: "Enviant…",
    requestError: "Hi ha hagut un problema. Torna-ho a provar.",
    accepted: "Hem rebut la sol·licitud. Revisa el correu per continuar.",
    openLabel: "Rebre novetats per correu",
    closeLabel: "Tanca",
    invalidEmail: "Introdueix un correu electrònic vàlid."
  },
  sv: {
    formLabel: "Prenumerera på nyheter via e-post",
    pending: "Skickar…",
    submitting: "Skickar…",
    requestError: "Något gick fel. Försök igen.",
    accepted: "Förfrågan mottagen. Kolla din e-post för nästa steg.",
    openLabel: "Prenumerera på nyheter via e-post",
    closeLabel: "Stäng",
    invalidEmail: "Ange en giltig e-postadress."
  },
  da: {
    formLabel: "Tilmeld dig nyheder via e-mail",
    pending: "Sender…",
    submitting: "Sender…",
    requestError: "Noget gik galt. Prøv igen.",
    accepted: "Anmodning modtaget. Tjek din e-mail for næste trin.",
    openLabel: "Tilmeld dig nyheder via e-mail",
    closeLabel: "Luk",
    invalidEmail: "Indtast en gyldig e-mailadresse."
  },
  nb: {
    formLabel: "Abonner på nyheter via e-post",
    pending: "Sender…",
    submitting: "Sender…",
    requestError: "Noe gikk galt. Prøv igjen.",
    accepted: "Forespørselen er mottatt. Sjekk e-posten din for neste steg.",
    openLabel: "Abonner på nyheter via e-post",
    closeLabel: "Lukk",
    invalidEmail: "Skriv inn en gyldig e-postadresse."
  },
  fi: {
    formLabel: "Tilaa uutiset sähköpostitse",
    pending: "Lähetetään…",
    submitting: "Lähetetään…",
    requestError: "Jokin meni pieleen. Yritä uudelleen.",
    accepted: "Pyyntö vastaanotettu. Tarkista sähköpostistasi seuraava vaihe.",
    openLabel: "Tilaa uutiset sähköpostitse",
    closeLabel: "Sulje",
    invalidEmail: "Anna kelvollinen sähköpostiosoite."
  },
  pl: {
    formLabel: "Otrzymuj nowości e-mailem",
    pending: "Wysyłanie…",
    submitting: "Wysyłanie…",
    requestError: "Coś poszło nie tak. Spróbuj ponownie.",
    accepted: "Zgłoszenie otrzymane. Sprawdź e-mail, aby kontynuować.",
    openLabel: "Otrzymuj nowości e-mailem",
    closeLabel: "Zamknij",
    invalidEmail: "Wpisz poprawny adres e-mail."
  },
  cs: {
    formLabel: "Odebírat novinky e-mailem",
    pending: "Odesílání…",
    submitting: "Odesílání…",
    requestError: "Něco se nepovedlo. Zkus to znovu.",
    accepted: "Požadavek přijat. Další krok najdeš v e-mailu.",
    openLabel: "Odebírat novinky e-mailem",
    closeLabel: "Zavřít",
    invalidEmail: "Zadej platnou e-mailovou adresu."
  },
  sk: {
    formLabel: "Odoberať novinky e-mailom",
    pending: "Odosielanie…",
    submitting: "Odosielanie…",
    requestError: "Niečo sa nepodarilo. Skús to znova.",
    accepted: "Žiadosť prijatá. Ďalší krok nájdeš v e-maile.",
    openLabel: "Odoberať novinky e-mailom",
    closeLabel: "Zavrieť",
    invalidEmail: "Zadaj platnú e-mailovú adresu."
  },
  hu: {
    formLabel: "Feliratkozás e-mailes hírekre",
    pending: "Küldés…",
    submitting: "Küldés…",
    requestError: "Valami hiba történt. Próbáld újra.",
    accepted: "Kérés fogadva. A következő lépésért nézd meg az e-mailjeidet.",
    openLabel: "Feliratkozás e-mailes hírekre",
    closeLabel: "Bezárás",
    invalidEmail: "Adj meg egy érvényes e-mail-címet."
  },
  ro: {
    formLabel: "Primește noutăți prin e-mail",
    pending: "Se trimite…",
    submitting: "Se trimite…",
    requestError: "Ceva nu a mers bine. Încearcă din nou.",
    accepted: "Cerere primită. Verifică e-mailul pentru a continua.",
    openLabel: "Primește noutăți prin e-mail",
    closeLabel: "Închide",
    invalidEmail: "Introdu o adresă de e-mail validă."
  },
  el: {
    formLabel: "Εγγραφή για νέα μέσω email",
    pending: "Αποστολή…",
    submitting: "Αποστολή…",
    requestError: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
    accepted: "Το αίτημα ελήφθη. Έλεγξε το email σου για το επόμενο βήμα.",
    openLabel: "Εγγραφή για νέα μέσω email",
    closeLabel: "Κλείσιμο",
    invalidEmail: "Συμπλήρωσε μια έγκυρη διεύθυνση email."
  },
  bg: {
    formLabel: "Абониране за новини по имейл",
    pending: "Изпращане…",
    submitting: "Изпращане…",
    requestError: "Възникна проблем. Опитай отново.",
    accepted: "Заявката е получена. Провери имейла си за следващата стъпка.",
    openLabel: "Абониране за новини по имейл",
    closeLabel: "Затвори",
    invalidEmail: "Въведи валиден имейл адрес."
  },
  hr: {
    formLabel: "Primaj novosti e-poštom",
    pending: "Slanje…",
    submitting: "Slanje…",
    requestError: "Nešto je pošlo po zlu. Pokušaj ponovno.",
    accepted: "Zahtjev je primljen. Provjeri e-poštu za sljedeći korak.",
    openLabel: "Primaj novosti e-poštom",
    closeLabel: "Zatvori",
    invalidEmail: "Unesi valjanu e-adresu."
  },
  sl: {
    formLabel: "Prejemaj novosti po e-pošti",
    pending: "Pošiljanje…",
    submitting: "Pošiljanje…",
    requestError: "Prišlo je do napake. Poskusi znova.",
    accepted: "Zahteva je prejeta. Preveri e-pošto za naslednji korak.",
    openLabel: "Prejemaj novosti po e-pošti",
    closeLabel: "Zapri",
    invalidEmail: "Vnesi veljaven e-naslov."
  },
  "sr-Latn": {
    formLabel: "Primaj novosti imejlom",
    pending: "Slanje…",
    submitting: "Slanje…",
    requestError: "Nešto nije u redu. Pokušaj ponovo.",
    accepted: "Zahtev je primljen. Proveri imejl za sledeći korak.",
    openLabel: "Primaj novosti imejlom",
    closeLabel: "Zatvori",
    invalidEmail: "Unesi važeću imejl adresu."
  },
  "sr-Cyrl": {
    formLabel: "Примај новости имејлом",
    pending: "Слање…",
    submitting: "Слање…",
    requestError: "Нешто није у реду. Покушај поново.",
    accepted: "Захтев је примљен. Провери имејл за следећи корак.",
    openLabel: "Примај новости имејлом",
    closeLabel: "Затвори",
    invalidEmail: "Унеси важећу имејл адресу."
  },
  uk: {
    formLabel: "Підписатися на новини електронною поштою",
    pending: "Надсилання…",
    submitting: "Надсилання…",
    requestError: "Щось пішло не так. Спробуй ще раз.",
    accepted: "Запит отримано. Перевір пошту для наступного кроку.",
    openLabel: "Підписатися на новини електронною поштою",
    closeLabel: "Закрити",
    invalidEmail: "Введи дійсну електронну адресу."
  },
  ru: {
    formLabel: "Подписаться на новости по электронной почте",
    pending: "Отправка…",
    submitting: "Отправка…",
    requestError: "Что-то пошло не так. Попробуй ещё раз.",
    accepted: "Запрос получен. Проверь почту для следующего шага.",
    openLabel: "Подписаться на новости по электронной почте",
    closeLabel: "Закрыть",
    invalidEmail: "Введи корректный адрес электронной почты."
  },
  tr: {
    formLabel: "E-postayla haberlere abone ol",
    pending: "Gönderiliyor…",
    submitting: "Gönderiliyor…",
    requestError: "Bir sorun oluştu. Lütfen tekrar dene.",
    accepted: "İsteğin alındı. Sonraki adım için e-postanı kontrol et.",
    openLabel: "E-postayla haberlere abone ol",
    closeLabel: "Kapat",
    invalidEmail: "Geçerli bir e-posta adresi gir."
  },
  ar: {
    formLabel: "الاشتراك في الأخبار بالبريد الإلكتروني",
    pending: "جارٍ الإرسال…",
    submitting: "جارٍ الإرسال…",
    requestError: "حدث خطأ. حاول مرة أخرى.",
    accepted: "تم استلام الطلب. راجع بريدك الإلكتروني للخطوة التالية.",
    openLabel: "الاشتراك في الأخبار بالبريد الإلكتروني",
    closeLabel: "إغلاق",
    invalidEmail: "أدخل عنوان بريد إلكتروني صالحًا."
  },
  he: {
    formLabel: "הרשמה לעדכונים באימייל",
    pending: "שולח…",
    submitting: "שולח…",
    requestError: "משהו השתבש. כדאי לנסות שוב.",
    accepted: "הבקשה התקבלה. השלב הבא נמצא באימייל שלך.",
    openLabel: "הרשמה לעדכונים באימייל",
    closeLabel: "סגירה",
    invalidEmail: "יש להזין כתובת אימייל תקינה."
  },
  fa: {
    formLabel: "دریافت خبرها با ایمیل",
    pending: "در حال ارسال…",
    submitting: "در حال ارسال…",
    requestError: "مشکلی پیش آمد. دوباره تلاش کنید.",
    accepted: "درخواست دریافت شد. برای مرحله بعد ایمیل خود را بررسی کنید.",
    openLabel: "دریافت خبرها با ایمیل",
    closeLabel: "بستن",
    invalidEmail: "یک نشانی ایمیل معتبر وارد کنید."
  },
  hi: {
    formLabel: "ईमेल पर खबरें पाएँ",
    pending: "भेज रहे हैं…",
    submitting: "भेज रहे हैं…",
    requestError: "कुछ गड़बड़ हुई। फिर कोशिश करें।",
    accepted: "अनुरोध मिल गया। अगले कदम के लिए अपना ईमेल देखें।",
    openLabel: "ईमेल पर खबरें पाएँ",
    closeLabel: "बंद करें",
    invalidEmail: "सही ईमेल पता दर्ज करें।"
  },
  bn: {
    formLabel: "ইমেইলে খবর পেতে নিবন্ধন করুন",
    pending: "পাঠানো হচ্ছে…",
    submitting: "পাঠানো হচ্ছে…",
    requestError: "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    accepted: "অনুরোধ পেয়েছি। পরের ধাপের জন্য ইমেইল দেখুন।",
    openLabel: "ইমেইলে খবর পেতে নিবন্ধন করুন",
    closeLabel: "বন্ধ করুন",
    invalidEmail: "একটি সঠিক ইমেইল ঠিকানা লিখুন।"
  },
  ta: {
    formLabel: "மின்னஞ்சலில் புதிய தகவல்களைப் பெற",
    pending: "அனுப்பப்படுகிறது…",
    submitting: "அனுப்பப்படுகிறது…",
    requestError: "பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
    accepted: "கோரிக்கை பெறப்பட்டது. அடுத்த படிக்கு உங்கள் மின்னஞ்சலைப் பாருங்கள்.",
    openLabel: "மின்னஞ்சலில் புதிய தகவல்களைப் பெற",
    closeLabel: "மூடு",
    invalidEmail: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்."
  },
  ur: {
    formLabel: "ای میل پر خبروں کے لیے اندراج کریں",
    pending: "بھیجا جا رہا ہے…",
    submitting: "بھیجا جا رہا ہے…",
    requestError: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
    accepted: "درخواست موصول ہو گئی۔ اگلے مرحلے کے لیے اپنا ای میل دیکھیں۔",
    openLabel: "ای میل پر خبروں کے لیے اندراج کریں",
    closeLabel: "بند کریں",
    invalidEmail: "درست ای میل پتہ درج کریں۔"
  },
  id: {
    formLabel: "Berlangganan kabar lewat email",
    pending: "Mengirim…",
    submitting: "Mengirim…",
    requestError: "Ada masalah. Coba lagi.",
    accepted: "Permintaan diterima. Cek emailmu untuk langkah berikutnya.",
    openLabel: "Berlangganan kabar lewat email",
    closeLabel: "Tutup",
    invalidEmail: "Masukkan alamat email yang valid."
  },
  ms: {
    formLabel: "Langgan berita melalui e-mel",
    pending: "Menghantar…",
    submitting: "Menghantar…",
    requestError: "Ada masalah. Cuba lagi.",
    accepted: "Permintaan diterima. Semak e-mel anda untuk langkah seterusnya.",
    openLabel: "Langgan berita melalui e-mel",
    closeLabel: "Tutup",
    invalidEmail: "Masukkan alamat e-mel yang sah."
  },
  vi: {
    formLabel: "Đăng ký nhận tin qua email",
    pending: "Đang gửi…",
    submitting: "Đang gửi…",
    requestError: "Đã xảy ra lỗi. Hãy thử lại.",
    accepted: "Đã nhận yêu cầu. Kiểm tra email để xem bước tiếp theo.",
    openLabel: "Đăng ký nhận tin qua email",
    closeLabel: "Đóng",
    invalidEmail: "Nhập địa chỉ email hợp lệ."
  },
  th: {
    formLabel: "สมัครรับข่าวสารทางอีเมล",
    pending: "กำลังส่ง…",
    submitting: "กำลังส่ง…",
    requestError: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง",
    accepted: "ได้รับคำขอแล้ว เช็กอีเมลเพื่อดูขั้นตอนถัดไป",
    openLabel: "สมัครรับข่าวสารทางอีเมล",
    closeLabel: "ปิด",
    invalidEmail: "กรุณากรอกอีเมลให้ถูกต้อง"
  },
  fil: {
    formLabel: "Tumanggap ng mga balita sa email",
    pending: "Ipinapadala…",
    submitting: "Ipinapadala…",
    requestError: "May nagkaproblema. Subukan ulit.",
    accepted: "Natanggap ang request. Tingnan ang email para sa susunod na hakbang.",
    openLabel: "Tumanggap ng mga balita sa email",
    closeLabel: "Isara",
    invalidEmail: "Maglagay ng wastong email address."
  },
  ja: {
    formLabel: "メールでニュースを受け取る",
    pending: "送信中…",
    submitting: "送信中…",
    requestError: "エラーが発生しました。もう一度お試しください。",
    accepted: "リクエストを受け付けました。次の手順をメールでご確認ください。",
    openLabel: "メールでニュースを受け取る",
    closeLabel: "閉じる",
    invalidEmail: "有効なメールアドレスを入力してください。"
  },
  ko: {
    formLabel: "이메일로 소식 구독하기",
    pending: "보내는 중…",
    submitting: "보내는 중…",
    requestError: "문제가 생겼어요. 다시 시도해 주세요.",
    accepted: "요청을 받았어요. 다음 단계는 이메일을 확인해 주세요.",
    openLabel: "이메일로 소식 구독하기",
    closeLabel: "닫기",
    invalidEmail: "올바른 이메일 주소를 입력해 주세요."
  },
  "zh-Hans": {
    formLabel: "通过邮件订阅新消息",
    pending: "发送中…",
    submitting: "发送中…",
    requestError: "出了点问题，请重试。",
    accepted: "已收到请求。请查看邮件，了解下一步。",
    openLabel: "通过邮件订阅新消息",
    closeLabel: "关闭",
    invalidEmail: "请输入有效的邮箱地址。"
  },
  "zh-Hant-TW": {
    formLabel: "訂閱電子報",
    pending: "傳送中…",
    submitting: "傳送中…",
    requestError: "出了點問題，請再試一次。",
    accepted: "已收到申請。請查看信箱，了解下一步。",
    openLabel: "訂閱電子報",
    closeLabel: "關閉",
    invalidEmail: "請輸入有效的電子信箱。"
  },
  "zh-Hant-HK": {
    formLabel: "透過電郵訂閱最新消息",
    pending: "傳送中…",
    submitting: "傳送中…",
    requestError: "出現問題，請再試一次。",
    accepted: "已收到申請。請查看電郵，了解下一步。",
    openLabel: "透過電郵訂閱最新消息",
    closeLabel: "關閉",
    invalidEmail: "請輸入有效的電郵地址。"
  },
  sw: {
    formLabel: "Jiandikishe kupokea habari kwa barua pepe",
    pending: "Inatuma…",
    submitting: "Inatuma…",
    requestError: "Hitilafu imetokea. Jaribu tena.",
    accepted: "Ombi limepokelewa. Angalia barua pepe yako kwa hatua inayofuata.",
    openLabel: "Jiandikishe kupokea habari kwa barua pepe",
    closeLabel: "Funga",
    invalidEmail: "Weka anwani sahihi ya barua pepe."
  },
  af: {
    formLabel: "Teken in vir nuus per e-pos",
    pending: "Stuur tans…",
    submitting: "Stuur tans…",
    requestError: "Iets het skeefgeloop. Probeer weer.",
    accepted: "Versoek ontvang. Kyk in jou e-pos vir die volgende stap.",
    openLabel: "Teken in vir nuus per e-pos",
    closeLabel: "Sluit",
    invalidEmail: "Voer ’n geldige e-posadres in."
  }
};
var accountLabels = {
  en: "My account",
  es: "Mi cuenta",
  "es-AR": "Mi cuenta",
  fr: "Mon compte",
  "fr-CA": "Mon compte",
  "pt-BR": "Minha conta",
  "pt-PT": "A minha conta",
  de: "Mein Konto",
  nl: "Mijn account",
  it: "Il mio account",
  ca: "El meu compte",
  sv: "Mitt konto",
  da: "Min konto",
  nb: "Min konto",
  fi: "Oma tili",
  pl: "Moje konto",
  cs: "Můj účet",
  sk: "Môj účet",
  hu: "Saját fiók",
  ro: "Contul meu",
  el: "Ο λογαριασμός μου",
  bg: "Моят профил",
  hr: "Moj račun",
  sl: "Moj račun",
  "sr-Cyrl": "Мој налог",
  "sr-Latn": "Moj nalog",
  uk: "Мій обліковий запис",
  ru: "Мой аккаунт",
  tr: "Hesabım",
  ar: "حسابي",
  he: "החשבון שלי",
  fa: "حساب من",
  hi: "मेरा खाता",
  bn: "আমার অ্যাকাউন্ট",
  ta: "எனது கணக்கு",
  ur: "میرا اکاؤنٹ",
  id: "Akun saya",
  ms: "Akaun saya",
  vi: "Tài khoản của tôi",
  th: "บัญชีของฉัน",
  fil: "Account ko",
  ja: "マイアカウント",
  ko: "내 계정",
  "zh-Hans": "我的账户",
  "zh-Hant-TW": "我的帳戶",
  "zh-Hant-HK": "我的帳戶",
  sw: "Akaunti yangu",
  af: "My rekening"
};
function defineLocale(locale, messageKey, directButton, emailLabel, invitingButton, dir = "ltr") {
  const shared = sharedMessages[messageKey];
  return Object.freeze({
    locale,
    dir,
    accountLabel: accountLabels[messageKey],
    styles: Object.freeze({
      direct: Object.freeze({
        ...shared,
        button: directButton,
        placeholder: ENGLISH_FOOTER_COPY.direct.placeholder,
        emailLabel
      }),
      inviting: Object.freeze({
        ...shared,
        button: invitingButton,
        placeholder: ENGLISH_FOOTER_COPY.inviting.placeholder,
        emailLabel
      }),
      ...messageKey === "en" ? Object.fromEntries(Object.entries(ENGLISH_FOOTER_COPY).map(([key, copy]) => [key, Object.freeze({
        ...shared,
        ...copy,
        emailLabel: "Email address"
      })])) : {}
    })
  });
}
var FOOTER_LOCALES = Object.freeze({
  en: defineLocale("en", "en", "Subscribe", "Email address", "Sign me up"),
  "en-US": defineLocale("en-US", "en", "Subscribe", "Your email address", "Sign me up"),
  "en-GB": defineLocale("en-GB", "en", "Subscribe", "Your email address", "Keep me in the loop"),
  "en-AU": defineLocale("en-AU", "en", "Get updates", "Your email address", "Keep me posted"),
  "en-IN": defineLocale("en-IN", "en", "Subscribe", "Email address", "Send me updates"),
  "en-SG": defineLocale("en-SG", "en", "Get updates", "Email address", "Keep me in the loop"),
  "es-ES": defineLocale("es-ES", "es", "Suscribirme", "Tu correo electrónico", "Quiero enterarme"),
  "es-MX": defineLocale("es-MX", "es", "Suscribirme", "Tu correo electrónico", "Quiero las novedades"),
  "es-AR": defineLocale("es-AR", "es-AR", "Suscribite", "Tu correo electrónico", "Avisame qué viene"),
  "es-CL": defineLocale("es-CL", "es", "Suscribirme", "Tu correo electrónico", "Avísenme las novedades"),
  "es-CO": defineLocale("es-CO", "es", "Recibir novedades", "Tu correo electrónico", "Quiero estar al día"),
  "es-PR": defineLocale("es-PR", "es", "Suscribirme", "Tu email", "Quiero enterarme"),
  "fr-FR": defineLocale("fr-FR", "fr", "S’abonner", "Votre adresse e-mail", "Je m’inscris"),
  "fr-CA": defineLocale("fr-CA", "fr-CA", "M’abonner", "Votre adresse courriel", "Je veux des nouvelles"),
  "pt-BR": defineLocale("pt-BR", "pt-BR", "Inscreva-se", "Seu e-mail", "Quero novidades"),
  "pt-PT": defineLocale("pt-PT", "pt-PT", "Subscrever", "O seu e-mail", "Quero ficar a par"),
  "de-DE": defineLocale("de-DE", "de", "Abonnieren", "Deine E-Mail-Adresse", "Halt mich auf dem Laufenden"),
  "de-CH": defineLocale("de-CH", "de", "Abonnieren", "Deine E-Mail-Adresse", "Ich will Neues erfahren"),
  "nl-NL": defineLocale("nl-NL", "nl", "Aanmelden", "Je e-mailadres", "Houd me op de hoogte"),
  "nl-BE": defineLocale("nl-BE", "nl", "Inschrijven", "Je e-mailadres", "Hou me op de hoogte"),
  "it-IT": defineLocale("it-IT", "it", "Iscrivimi", "La tua email", "Tienimi al corrente"),
  "ca-ES": defineLocale("ca-ES", "ca", "Subscriu-m’hi", "El teu correu electrònic", "Vull estar al dia"),
  "sv-SE": defineLocale("sv-SE", "sv", "Prenumerera", "Din e-postadress", "Håll mig uppdaterad"),
  "da-DK": defineLocale("da-DK", "da", "Tilmeld mig", "Din e-mailadresse", "Hold mig opdateret"),
  "nb-NO": defineLocale("nb-NO", "nb", "Abonner", "E-postadressen din", "Hold meg oppdatert"),
  "fi-FI": defineLocale("fi-FI", "fi", "Tilaa uutiset", "Sähköpostiosoitteesi", "Pidä minut ajan tasalla"),
  "pl-PL": defineLocale("pl-PL", "pl", "Zapisz mnie", "Twój adres e-mail", "Chcę być na bieżąco"),
  "cs-CZ": defineLocale("cs-CZ", "cs", "Odebírat novinky", "Tvůj e-mail", "Chci vědět, co je nového"),
  "sk-SK": defineLocale("sk-SK", "sk", "Odoberať novinky", "Tvoj e-mail", "Chcem vedieť, čo je nové"),
  "hu-HU": defineLocale("hu-HU", "hu", "Feliratkozom", "Az e-mail-címed", "Kérem az újdonságokat"),
  "ro-RO": defineLocale("ro-RO", "ro", "Abonează-mă", "Adresa ta de e-mail", "Vreau noutăți"),
  "el-GR": defineLocale("el-GR", "el", "Εγγραφή", "Το email σου", "Θέλω να μαθαίνω τα νέα"),
  "bg-BG": defineLocale("bg-BG", "bg", "Абонирай ме", "Твоят имейл", "Искам да научавам новостите"),
  "hr-HR": defineLocale("hr-HR", "hr", "Pretplati me", "Tvoja e-adresa", "Želim čuti novosti"),
  "sl-SI": defineLocale("sl-SI", "sl", "Naroči me", "Tvoj e-naslov", "Želim biti na tekočem"),
  "sr-Latn-RS": defineLocale("sr-Latn-RS", "sr-Latn", "Prijavi me", "Tvoja imejl adresa", "Želim da čujem novosti"),
  "sr-Cyrl-RS": defineLocale("sr-Cyrl-RS", "sr-Cyrl", "Пријави ме", "Твоја имејл адреса", "Желим да чујем новости"),
  "uk-UA": defineLocale("uk-UA", "uk", "Підписатися", "Твоя електронна адреса", "Хочу знати, що нового"),
  "ru-RU": defineLocale("ru-RU", "ru", "Подписаться", "Твоя электронная почта", "Хочу быть в курсе"),
  "tr-TR": defineLocale("tr-TR", "tr", "Abone ol", "E-posta adresin", "Yeniliklerden haberim olsun"),
  ar: defineLocale("ar", "ar", "اشترك", "بريدك الإلكتروني", "أرسلوا لي الجديد", "rtl"),
  "ar-EG": defineLocale("ar-EG", "ar", "اشترك", "بريدك الإلكتروني", "أرسلوا لي الأخبار", "rtl"),
  "ar-SA": defineLocale("ar-SA", "ar", "اشترك", "بريدك الإلكتروني", "أريد معرفة الجديد", "rtl"),
  "he-IL": defineLocale("he-IL", "he", "הרשמה לעדכונים", "כתובת האימייל שלך", "אשמח להתעדכן", "rtl"),
  "fa-IR": defineLocale("fa-IR", "fa", "دریافت خبرها", "نشانی ایمیل شما", "من را هم باخبر کنید", "rtl"),
  "hi-IN": defineLocale("hi-IN", "hi", "अपडेट पाएँ", "आपका ईमेल पता", "मुझे भी बताते रहें"),
  "bn-BD": defineLocale("bn-BD", "bn", "আপডেট পেতে চাই", "আপনার ইমেইল", "আমাকেও জানাবেন"),
  "ta-IN": defineLocale("ta-IN", "ta", "புதிய தகவல்களைப் பெற", "உங்கள் மின்னஞ்சல்", "எனக்கும் தெரியப்படுத்துங்கள்"),
  "ur-PK": defineLocale("ur-PK", "ur", "اپ ڈیٹس حاصل کریں", "آپ کا ای میل پتہ", "مجھے بھی باخبر رکھیں", "rtl"),
  "id-ID": defineLocale("id-ID", "id", "Berlangganan", "Alamat email kamu", "Kabari aku, ya"),
  "ms-MY": defineLocale("ms-MY", "ms", "Langgan", "Alamat e-mel anda", "Saya mahu berita terkini"),
  "vi-VN": defineLocale("vi-VN", "vi", "Đăng ký nhận tin", "Email của bạn", "Cho mình biết nhé"),
  "th-TH": defineLocale("th-TH", "th", "รับข่าวสาร", "อีเมลของคุณ", "มีอะไรใหม่ บอกกันด้วย"),
  "fil-PH": defineLocale("fil-PH", "fil", "Tumanggap ng updates", "Email mo", "Gusto ko ng balita"),
  "ja-JP": defineLocale("ja-JP", "ja", "ニュースを受け取る", "メールアドレス", "新着情報を届けて"),
  "ko-KR": defineLocale("ko-KR", "ko", "구독하기", "이메일 주소", "새 소식 받을래요"),
  "zh-Hans-CN": defineLocale("zh-Hans-CN", "zh-Hans", "订阅更新", "你的邮箱地址", "有新消息告诉我"),
  "zh-Hant-TW": defineLocale("zh-Hant-TW", "zh-Hant-TW", "訂閱電子報", "你的電子信箱", "有新消息，告訴我"),
  "zh-Hant-HK": defineLocale("zh-Hant-HK", "zh-Hant-HK", "訂閱最新消息", "你的電郵地址", "有新消息，通知我"),
  "sw-KE": defineLocale("sw-KE", "sw", "Pokea taarifa", "Barua pepe yako", "Nijulishe mapya"),
  "af-ZA": defineLocale("af-ZA", "af", "Teken in", "Jou e-posadres", "Hou my op hoogte")
});
var languageDefaults = Object.freeze({
  en: "en",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
  de: "de-DE",
  nl: "nl-NL",
  it: "it-IT",
  ca: "ca-ES",
  sv: "sv-SE",
  da: "da-DK",
  nb: "nb-NO",
  fi: "fi-FI",
  pl: "pl-PL",
  cs: "cs-CZ",
  sk: "sk-SK",
  hu: "hu-HU",
  ro: "ro-RO",
  el: "el-GR",
  bg: "bg-BG",
  hr: "hr-HR",
  sl: "sl-SI",
  sr: "sr-Cyrl-RS",
  uk: "uk-UA",
  ru: "ru-RU",
  tr: "tr-TR",
  ar: "ar",
  he: "he-IL",
  fa: "fa-IR",
  hi: "hi-IN",
  bn: "bn-BD",
  ta: "ta-IN",
  ur: "ur-PK",
  id: "id-ID",
  ms: "ms-MY",
  vi: "vi-VN",
  th: "th-TH",
  fil: "fil-PH",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-Hans-CN",
  sw: "sw-KE",
  af: "af-ZA"
});
function matchLocale(preference) {
  const value = preference.trim();
  if (!value || value.length > 100)
    return;
  let parsed;
  try {
    parsed = new Intl.Locale(value);
  } catch {
    return;
  }
  const exact = FOOTER_LOCALES[parsed.baseName];
  if (exact)
    return exact;
  const {
    language,
    region,
    script
  } = parsed;
  if (language === "zh") {
    if (script && script !== "Hans" && script !== "Hant")
      return;
    if (script === "Hans")
      return FOOTER_LOCALES["zh-Hans-CN"];
    if (script === "Hant" || region === "HK" || region === "MO" || region === "TW") {
      return FOOTER_LOCALES[region === "HK" || region === "MO" ? "zh-Hant-HK" : "zh-Hant-TW"];
    }
    return FOOTER_LOCALES["zh-Hans-CN"];
  }
  if (language === "sr") {
    if (script && script !== "Latn" && script !== "Cyrl")
      return;
    return FOOTER_LOCALES[script === "Latn" ? "sr-Latn-RS" : "sr-Cyrl-RS"];
  }
  const defaultKey = languageDefaults[language];
  if (!defaultKey)
    return;
  if (script) {
    const defaultScript = new Intl.Locale(defaultKey).maximize().script;
    if (script !== defaultScript)
      return;
  }
  if (language === "es" && region === "419")
    return FOOTER_LOCALES["es-MX"];
  return FOOTER_LOCALES[defaultKey];
}
function resolveFooterLocale(preferred) {
  const preferences = typeof preferred === "string" ? [preferred] : preferred ?? [];
  for (const preference of preferences) {
    if (typeof preference !== "string")
      continue;
    const locale = matchLocale(preference);
    if (locale)
      return locale;
  }
  return FOOTER_LOCALES.en;
}
var stableDescriptions = {
  en: "Get updates by email. You're subscribed once you confirm your address.",
  es: "Recibe novedades por correo. Confirma tu dirección para suscribirte.",
  fr: "Recevez les nouveautés par e-mail. Confirmez votre adresse pour vous abonner.",
  pt: "Receba novidades por e-mail. Confirme seu endereço para assinar.",
  de: "Erhalte Neuigkeiten per E-Mail. Bestätige deine Adresse, um dich anzumelden.",
  nl: "Ontvang nieuws per e-mail. Bevestig je adres om je aan te melden.",
  it: "Ricevi novità via email. Conferma il tuo indirizzo per iscriverti.",
  ca: "Rep novetats per correu. Confirma la teva adreça per subscriure-t'hi.",
  sv: "Få nyheter via e-post. Bekräfta din adress för att prenumerera.",
  da: "Få nyt via e-mail. Bekræft din adresse for at tilmelde dig.",
  nb: "Få nyheter på e-post. Bekreft adressen din for å abonnere.",
  fi: "Saa uutisia sähköpostitse. Vahvista osoitteesi tilataksesi.",
  pl: "Otrzymuj nowości e-mailem. Potwierdź adres, aby się zapisać.",
  cs: "Dostávejte novinky e-mailem. Pro odběr potvrďte svou adresu.",
  sk: "Dostávajte novinky e-mailom. Na odber potvrďte svoju adresu.",
  hu: "Kapj híreket e-mailben. A feliratkozáshoz erősítsd meg a címed.",
  ro: "Primește noutăți prin e-mail. Confirmă adresa pentru a te abona.",
  el: "Λάβετε νέα μέσω email. Επιβεβαιώστε τη διεύθυνσή σας για εγγραφή.",
  bg: "Получавайте новини по имейл. Потвърдете адреса си, за да се абонирате.",
  hr: "Primajte novosti e-poštom. Potvrdite adresu za pretplatu.",
  sl: "Prejemajte novice po e-pošti. Za naročilo potrdite svoj naslov.",
  "sr-Cyrl": "Примајте новости е-поштом. Потврдите адресу да бисте се претплатили.",
  "sr-Latn": "Primajte novosti e-poštom. Potvrdite adresu da biste se pretplatili.",
  uk: "Отримуйте новини електронною поштою. Підтвердьте адресу, щоб підписатися.",
  ru: "Получайте новости по электронной почте. Подтвердите адрес, чтобы подписаться.",
  tr: "Yenilikleri e-postayla alın. Abone olmak için adresinizi doğrulayın.",
  ar: "تلقَّ المستجدات عبر البريد الإلكتروني. أكّد عنوانك للاشتراك.",
  he: "קבלו עדכונים בדוא״ל. אשרו את הכתובת כדי להירשם.",
  fa: "تازه‌ها را با ایمیل دریافت کنید. برای اشتراک، نشانی خود را تأیید کنید.",
  hi: "ईमेल से नई जानकारी पाएँ। सदस्यता के लिए अपना पता सत्यापित करें।",
  bn: "ইমেলে নতুন খবর পান। সদস্য হতে আপনার ঠিকানা নিশ্চিত করুন।",
  ta: "புதிய தகவல்களை மின்னஞ்சலில் பெறுங்கள். சந்தா சேர உங்கள் முகவரியை உறுதிப்படுத்துங்கள்.",
  ur: "تازہ معلومات ای میل سے حاصل کریں۔ رکنیت کے لیے اپنا پتا تصدیق کریں۔",
  id: "Terima kabar terbaru lewat email. Konfirmasikan alamat Anda untuk berlangganan.",
  ms: "Terima berita terkini melalui e-mel. Sahkan alamat anda untuk melanggan.",
  vi: "Nhận tin mới qua email. Xác nhận địa chỉ để đăng ký.",
  th: "รับข่าวสารทางอีเมล ยืนยันที่อยู่อีเมลเพื่อสมัครรับข่าวสาร",
  fil: "Tumanggap ng balita sa email. Kumpirmahin ang iyong address para mag-subscribe.",
  ja: "最新情報をメールで受け取れます。登録にはメールアドレスの確認が必要です。",
  ko: "이메일로 새 소식을 받아보세요. 구독하려면 이메일 주소를 확인해 주세요.",
  "zh-Hans": "通过电子邮件接收新消息。确认您的邮箱地址即可订阅。",
  "zh-Hant": "透過電子郵件接收新消息。確認您的信箱地址即可訂閱。",
  sw: "Pokea habari mpya kwa barua pepe. Thibitisha anwani yako ili kujisajili.",
  af: "Ontvang nuus per e-pos. Bevestig jou adres om in te teken."
};
function stableFooterMessages(locale, audience, productName) {
  const copy = locale.styles.direct;
  const english = /^en(?:-|$)/u.test(locale.locale);
  const language = locale.locale.split("-")[0];
  const key = language === "zh" ? locale.locale.includes("Hant") ? "zh-Hant" : "zh-Hans" : language === "sr" ? locale.locale.includes("Latn") ? "sr-Latn" : "sr-Cyrl" : language;
  return {
    ...copy,
    button: english ? "Get email updates" : copy.formLabel,
    title: english ? "Get email updates" : copy.formLabel,
    description: english && audience === "hraness" ? "Get new writing and updates on Hraness projects. Confirm your email to subscribe." : english && productName !== undefined ? `Get ${productName} updates by email. You're subscribed once you confirm your address.` : stableDescriptions[key] ?? stableDescriptions.en,
    submit: english ? "Subscribe" : copy.button,
    placeholder: "you@example.com"
  };
}

// src/experiment.ts
var DEFAULT_FOOTER_VARIANT = Object.freeze({
  layout: "inline",
  copyStyle: "direct",
  color: "green",
  shimmer: false
});
function parseFooterVariant(value) {
  if (!record(value) || value.layout !== "inline" && value.layout !== "button" || !isFooterCopyStyle(value.copyStyle) || value.color !== "green" && value.color !== "orange" && value.color !== "blue" || typeof value.shimmer !== "boolean")
    throw new TypeError("Invalid Hraness footer experiment variant.");
  return {
    layout: value.layout,
    copyStyle: value.copyStyle,
    color: value.color,
    shimmer: value.shimmer
  };
}
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseFooterEnrollment(value) {
  if (!record(value) || value.version !== 1 || typeof value.token !== "string" || !/^[0-9a-f]{64}$/u.test(value.token) || !record(value.assignment))
    return null;
  const a = value.assignment;
  if (typeof a.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(a.id) || typeof a.locale !== "string" || !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,3}$/u.test(a.locale) || a.layout !== "inline" && a.layout !== "button" || !isFooterCopyStyle(a.copyStyle) || a.color !== "green" && a.color !== "orange" && a.color !== "blue" || typeof a.shimmer !== "boolean" || a.cohort !== "explore" && a.cohort !== "exploit" || typeof a.policyVersion !== "string" || !/^[A-Za-z0-9._-]{1,100}$/u.test(a.policyVersion))
    return null;
  return {
    version: 1,
    token: value.token,
    assignment: {
      id: a.id,
      locale: a.locale,
      layout: a.layout,
      copyStyle: a.copyStyle,
      color: a.color,
      shimmer: a.shimmer,
      cohort: a.cohort,
      policyVersion: a.policyVersion
    }
  };
}
// node_modules/@hugeicons/core-free-icons/dist/esm/CircleQuestionMarkIcon.js
var CircleQuestionMarkIcon = [
  ["circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }],
  ["path", { d: "M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "2" }]
];
// node_modules/@hugeicons/core-free-icons/dist/esm/GithubIcon.js
var GithubIcon = [
  ["path", { d: "M10 20.5675C6.57143 21.7248 3.71429 20.5675 2 17", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M10 22V18.7579C10 18.1596 10.1839 17.6396 10.4804 17.1699C10.6838 16.8476 10.5445 16.3904 10.1771 16.2894C7.13394 15.4528 5 14.1077 5 9.64606C5 8.48611 5.38005 7.39556 6.04811 6.4464C6.21437 6.21018 6.29749 6.09208 6.31748 5.9851C6.33746 5.87813 6.30272 5.73852 6.23322 5.45932C5.95038 4.32292 5.96871 3.11619 6.39322 2.02823C6.39322 2.02823 7.27042 1.74242 9.26698 2.98969C9.72282 3.27447 9.95075 3.41686 10.1515 3.44871C10.3522 3.48056 10.6206 3.41384 11.1573 3.28041C11.8913 3.09795 12.6476 3 13.5 3C14.3524 3 15.1087 3.09795 15.8427 3.28041C16.3794 3.41384 16.6478 3.48056 16.8485 3.44871C17.0493 3.41686 17.2772 3.27447 17.733 2.98969C19.7296 1.74242 20.6068 2.02823 20.6068 2.02823C21.0313 3.11619 21.0496 4.32292 20.7668 5.45932C20.6973 5.73852 20.6625 5.87813 20.6825 5.9851C20.7025 6.09207 20.7856 6.21019 20.9519 6.4464C21.6199 7.39556 22 8.48611 22 9.64606C22 14.1077 19.8661 15.4528 16.8229 16.2894C16.4555 16.3904 16.3162 16.8476 16.5196 17.1699C16.8161 17.6396 17 18.1596 17 18.7579V22", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }]
];
// node_modules/@hugeicons/core-free-icons/dist/esm/Linkedin01Icon.js
var Linkedin01Icon = [
  ["path", { d: "M7 10V17", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M11 13V17M11 13C11 11.3431 12.3431 10 14 10C15.6569 10 17 11.3431 17 13V17M11 13V10", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }],
  ["path", { d: "M7.125 6.75H7M7.25 6.75C7.25 6.88807 7.13807 7 7 7C6.86193 7 6.75 6.88807 6.75 6.75C6.75 6.61193 6.86193 6.5 7 6.5C7.13807 6.5 7.25 6.61193 7.25 6.75Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "2" }],
  ["path", { d: "M3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "3" }]
];
// node_modules/@hugeicons/core-free-icons/dist/esm/NewTwitterIcon.js
var NewTwitterIcon = [
  ["path", { d: "M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }]
];
// node_modules/@hraness/support-foundation/dist/index.js
var SOURCES = ["cli", "agent", "web", "desktop", "skill"];
var ACCOUNT_ORIGIN = "https://account.hraness.com";
var UNSAFE_TEXT = new RegExp("[\\p{Cc}\\p{Cf}\\p{Zl}\\p{Zp}]", "u");
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function plainText(value, max) {
  return typeof value === "string" && value.length > 0 && value.length <= max && value.trim() === value && !UNSAFE_TEXT.test(value);
}
function parseSupportProfile(value) {
  if (!isRecord(value) || Object.keys(value).sort().join(",") !== "id,name,updates,valueProposition" || typeof value.id !== "string" || !/^[a-z][a-z0-9-]{0,47}$/.test(value.id) || !plainText(value.name, 80) || !plainText(value.valueProposition, 240) || typeof value.updates !== "boolean")
    return null;
  return Object.freeze({
    id: value.id,
    name: value.name,
    valueProposition: value.valueProposition,
    updates: value.updates
  });
}
function createSupportOffer(profile, source) {
  const parsed = parseSupportProfile(profile);
  if (parsed === null || !SOURCES.includes(source)) {
    throw new TypeError("Invalid support profile or source.");
  }
  const destination = new URL("/support", ACCOUNT_ORIGIN);
  destination.searchParams.set("product", parsed.id);
  destination.searchParams.set("source", source);
  const actions = [];
  if (parsed.updates) {
    actions.push(Object.freeze({
      kind: "updates",
      label: `Get free ${parsed.name} product updates`,
      url: `${destination.href}#updates`
    }));
  }
  actions.push(Object.freeze({
    kind: "support",
    label: "Explore optional paid support",
    url: `${destination.href}#support`
  }));
  return Object.freeze({
    schemaVersion: "hraness-support-offer-v1",
    optional: true,
    product: Object.freeze({ id: parsed.id, name: parsed.name }),
    valueProposition: parsed.valueProposition,
    actions: Object.freeze(actions)
  });
}

// src/internal.ts
var DEFAULT_FOOTER_PRESENTATION = {
  locale: resolveFooterLocale(),
  variant: DEFAULT_FOOTER_VARIANT,
  sticky: true
};
var HRANESS_FOOTER_LABEL = "Hraness network";
var HRANESS_FOOTER_SLOT = "hraness-site-footer";
var HRANESS_MAILING_FORM_SLOT = "hraness-mailing-list-signup";
var HRANESS_MAILING_SOURCE = "hraness-site-footer";
var HRANESS_MAILING_STATUS_SLOT = "hraness-mailing-list-status";
var HRANESS_MAILING_SUBSCRIBE_URL = "https://account.hraness.com/api/mailing/subscribe";
var HRANESS_ACCOUNT_URL = "https://account.hraness.com/";
var HRANESS_MAILING_HONEYPOT_FIELD = "website";
var HRANESS_CONSENT_SLOT = "hraness-cookie-consent";
var HRANESS_CONSENT_ACCEPT_SLOT = "hraness-cookie-consent-accept";
var MAX_AUDIENCE_LENGTH = 24;
var MAX_PRODUCT_NAME_LENGTH = 48;
var PRODUCT_NAME_PATTERN = new RegExp("^[\\p{L}\\p{N}][\\p{L}\\p{N} .'&+-]{0,47}$", "u");
var MAX_SOCIAL_HREF_LENGTH = 200;
var MAX_SOCIAL_LABEL_LENGTH = 64;
var AUDIENCE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
var SOCIAL_LABEL_PATTERN = new RegExp("^[\\p{L}\\p{N}][\\p{L}\\p{N} .'+/-]{0,62}$", "u");
var SOCIAL_HREF_HOSTS = {
  github: "github.com",
  linkedin: "www.linkedin.com",
  substack: "substack.com",
  x: "x.com"
};
var SOCIAL_HREF_PATHS = {
  github: /^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)?$/u,
  linkedin: /^\/(?:company|in)\/[A-Za-z0-9_-]+$/u,
  substack: /^\/@[A-Za-z0-9_-]+$/u,
  x: /^\/[A-Za-z0-9_]{1,15}$/u
};
var HRANESS_SOCIAL_PLATFORMS = ["substack", "x", "linkedin", "github"];
var HRANESS_SOCIAL_LINKS = [{
  platform: "substack",
  label: "Hraness on Substack",
  title: "Substack",
  href: "https://substack.com/@hraness"
}, {
  platform: "x",
  label: "Hraness on X",
  title: "X",
  href: "https://x.com/hraness"
}, {
  platform: "linkedin",
  label: "Hraness on LinkedIn",
  title: "LinkedIn",
  href: "https://www.linkedin.com/company/hraness"
}, {
  platform: "github",
  label: "Hraness on GitHub",
  title: "GitHub",
  href: "https://github.com/hraness"
}];
var SUBSTACK_ICON = [["path", {
  d: "M22.539 8.242H1.46V5.406h21.08v2.836ZM1.46 10.812v2.836h21.08v-2.836H1.46ZM22.54 16.218V24L12 18.11 1.46 24v-7.782h21.08ZM1.46 0v2.836h21.08V0H1.46Z",
  fill: "currentColor"
}]];
var ICONS = {
  substack: SUBSTACK_ICON,
  x: NewTwitterIcon,
  linkedin: Linkedin01Icon,
  github: GithubIcon
};
var ATTRIBUTE_NAMES = {
  cx: "cx",
  cy: "cy",
  d: "d",
  fill: "fill",
  fillRule: "fill-rule",
  r: "r",
  stroke: "stroke",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeWidth: "stroke-width"
};
function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function parseHranessMailingListConfig(value) {
  if (typeof value !== "object" || value === null || !("kind" in value)) {
    throw new TypeError("Hraness site footer mailingList must be explicitly configured.");
  }
  if (value.kind === "none" || value.kind === "account")
    return value;
  if (value.kind !== "signup" || typeof value.audience !== "string") {
    throw new TypeError("Hraness site footer mailingList configuration is invalid.");
  }
  if (value.audience.length === 0 || value.audience.length > MAX_AUDIENCE_LENGTH || value.audience.trim() !== value.audience || !AUDIENCE_PATTERN.test(value.audience)) {
    throw new TypeError(`Hraness mailing-list audience IDs must be canonical lowercase slugs of at most ${MAX_AUDIENCE_LENGTH} characters.`);
  }
  if (value.name !== undefined && (typeof value.name !== "string" || value.name.length > MAX_PRODUCT_NAME_LENGTH || value.name.trim() !== value.name || !PRODUCT_NAME_PATTERN.test(value.name))) {
    throw new TypeError(`Hraness mailing-list product names must be plain names of at most ${MAX_PRODUCT_NAME_LENGTH} characters.`);
  }
  return value;
}
function isHranessSocialPlatform(value) {
  return HRANESS_SOCIAL_PLATFORMS.includes(value);
}
function parseHranessSocialHref(platform, href) {
  if (href.length === 0 || href.length > MAX_SOCIAL_HREF_LENGTH) {
    throw new TypeError("Hraness site footer social hrefs must be canonical https profile URLs.");
  }
  let url;
  try {
    url = new URL(href);
  } catch {
    throw new TypeError("Hraness site footer social hrefs must be canonical https profile URLs.");
  }
  if (url.protocol !== "https:" || url.username !== "" || url.password !== "" || url.port !== "" || url.search !== "" || url.hash !== "" || url.hostname !== SOCIAL_HREF_HOSTS[platform] || !SOCIAL_HREF_PATHS[platform].test(url.pathname) || url.href !== href) {
    throw new TypeError("Hraness site footer social hrefs must be canonical https profile URLs.");
  }
  return href;
}
function parseHranessSocialOverride(platform, value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Hraness site footer social configuration is invalid.");
  }
  const keys = Object.keys(value);
  if (keys.some((key) => key !== "href" && key !== "label")) {
    throw new TypeError("Hraness site footer social overrides may only set href and label.");
  }
  if (!("href" in value) || typeof value.href !== "string") {
    throw new TypeError("Hraness site footer social configuration is invalid.");
  }
  const href = parseHranessSocialHref(platform, value.href);
  if (!("label" in value) || value.label === undefined) {
    return {
      href
    };
  }
  if (typeof value.label !== "string") {
    throw new TypeError("Hraness site footer social labels must be specific accessible names.");
  }
  if (value.label.length === 0 || value.label.length > MAX_SOCIAL_LABEL_LENGTH || value.label.trim() !== value.label || !SOCIAL_LABEL_PATTERN.test(value.label)) {
    throw new TypeError(`Hraness site footer social labels must be specific accessible names of at most ${MAX_SOCIAL_LABEL_LENGTH} characters.`);
  }
  return {
    href,
    label: value.label
  };
}
function parseHranessSocialConfig(value) {
  if (value === undefined)
    return {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("Hraness site footer social configuration is invalid.");
  }
  const parsed = {};
  for (const [platform, override] of Object.entries(value)) {
    if (!isHranessSocialPlatform(platform) || override === undefined) {
      throw new TypeError("Hraness site footer social overrides may only retarget substack, x, linkedin, or github.");
    }
    parsed[platform] = parseHranessSocialOverride(platform, override);
  }
  return parsed;
}
function resolveHranessSocialLinks(value) {
  const overrides = parseHranessSocialConfig(value);
  return HRANESS_SOCIAL_LINKS.map((link) => {
    const override = overrides[link.platform];
    if (override === undefined)
      return link;
    return {
      href: override.href,
      label: override.label ?? link.label,
      platform: link.platform,
      title: link.title
    };
  });
}
function renderIconPaths(icon) {
  return icon.map(([tag, attributes]) => {
    if (tag !== "path" && tag !== "circle") {
      throw new TypeError(`Unsupported Hraness footer icon element: ${tag}`);
    }
    const renderedAttributes = Object.entries(attributes).filter(([name]) => name !== "key").map(([name, value]) => {
      const attributeName = ATTRIBUTE_NAMES[name];
      if (attributeName === undefined) {
        throw new TypeError(`Unsupported Hraness footer icon attribute: ${name}`);
      }
      return `${attributeName}="${escapeAttribute(value)}"`;
    }).join(" ");
    return `<${tag} ${renderedAttributes}></${tag}>`;
  }).join("");
}
function renderSocialIcon(platform) {
  return `<svg aria-hidden="true" class="${footerClasses.socialIcon}" data-slot="social-icon" fill="none" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${renderIconPaths(ICONS[platform])}</svg>`;
}
var SUPPORT_ICON = CircleQuestionMarkIcon;
var HRANESS_SUPPORT_ICON_HTML = `<svg aria-hidden="true" class="${footerClasses.supportIcon}" data-slot="hraness-support-icon" fill="none" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${renderIconPaths(SUPPORT_ICON)}</svg>`;
var RA_MARK = `<svg aria-hidden="true" class="${footerClasses.mark}" data-slot="hraness-mark" focusable="false" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M372 141a116 116 0 1 1-232 0 116 116 0 1 1 232 0Zm-14 0a102 102 0 1 0-204 0 102 102 0 1 0 204 0Zm-8 0a94 94 0 1 1-188 0 94 94 0 1 1 188 0Z" fill="currentColor" fill-rule="evenodd"></path><path d="M211 252c75-8 154 30 204 94 32 40 51 89 59 142H184c20-28 29-57 22-87-9-39-26-71-28-99-2-22 9-39 33-50Z" fill="currentColor"></path><path d="M246 270c-27-20-67-23-100-9-25 11-42 31-46 56l-34 20 38 12c4 25 14 47 31 66 15 13 22 32 18 56l-14 17h116c-20-27-23-50-8-68 6-8 14-14 23-21 23-20 34-50 28-79-5-22-23-40-52-50ZM132 309c9-14 22-22 38-22 13 0 25 7 34 19-10 14-23 22-39 22-14 0-25-6-33-19Z" fill="currentColor" fill-rule="evenodd"></path><path d="M151 410c-2 30-16 57-43 78h197c-19-27-40-49-63-63-28-18-59-23-91-15Z" fill="currentColor"></path><circle cx="166" cy="307" fill="currentColor" r="8"></circle></svg>`;
var HRANESS_SITE_FOOTER_BRAND_HTML = `<a aria-label="Hraness home" class="${footerClasses.brand}" href="https://hraness.com/" lang="en" dir="ltr">${RA_MARK}<span class="${footerClasses.brandName}">by Hraness</span></a>`;
function renderHranessSocialLinksHtml(socialLinks) {
  return `<nav aria-label="Hraness links" class="${footerClasses.links}"><ul class="${footerClasses.socials}">${socialLinks.map((link, index) => `<li class="${socialItemClassName(index)}"><a aria-label="${escapeAttribute(link.label)}" class="${footerClasses.socialLink}" href="${escapeAttribute(link.href)}" rel="me" title="${escapeAttribute(link.title)}">${renderSocialIcon(link.platform)}</a></li>`).join("")}</ul></nav>`;
}
var MAILING_IDLE_STATE = {
  kind: "idle"
};
function renderMailingList(mailingList, state, presentation) {
  const {
    locale
  } = presentation;
  const copy = stableFooterMessages(locale, mailingList.audience, mailingList.name);
  const localAttributes = ` lang="${escapeAttribute(locale.locale)}" dir="${locale.dir}"`;
  const email = state.kind === "pending" || state.kind === "error" ? ` value="${escapeAttribute(state.email)}"` : "";
  const pending = state.kind === "pending";
  const accepted = state.kind === "accepted";
  const statusCopy = pending ? copy.submitting : accepted ? copy.accepted : state.kind === "error" ? copy.requestError : "";
  const titleId = "hraness-mailing-dialog-title";
  const descriptionId = "hraness-mailing-dialog-description";
  const classes = disclosureClassNames("button");
  return `<details class="${classes.root}" data-slot="hraness-mailing-disclosure"${localAttributes} data-layout="button" data-presentation="stable-modal-v1"><summary data-foil="" class="${classes.trigger}"><span class="${footerClasses.disclosureLabel}">${escapeAttribute(copy.button)}</span></summary><dialog open="" class="${footerClasses.dialog}" data-slot="hraness-mailing-dialog" aria-labelledby="${titleId}" aria-describedby="${descriptionId}"><div class="${footerClasses.dialogHeader}"><h2 class="${footerClasses.dialogTitle}" id="${titleId}">${escapeAttribute(copy.title)}</h2><button class="${footerClasses.dialogClose}" data-slot="hraness-mailing-close" type="button" aria-label="${escapeAttribute(copy.closeLabel)}" hidden=""><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" focusable="false"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg></button></div><p class="${footerClasses.dialogDescription}" id="${descriptionId}">${escapeAttribute(copy.description)}</p><form accept-charset="UTF-8" action="${HRANESS_MAILING_SUBSCRIBE_URL}" aria-label="${escapeAttribute(copy.formLabel)}"${localAttributes} class="${footerClasses.mailing}" data-slot="${HRANESS_MAILING_FORM_SLOT}" data-state="${state.kind}" enctype="multipart/form-data" method="post"${pending ? ' aria-busy="true"' : ""}${accepted ? ' hidden=""' : ""}><input name="audience" type="hidden" value="${escapeAttribute(mailingList.audience)}"><input name="source" type="hidden" value="${HRANESS_MAILING_SOURCE}"><input name="experimentToken" type="hidden" value="" disabled=""><div class="${footerClasses.mailingControls}"><label class="${footerClasses.mailingLabel}"><span class="${footerClasses.emailLabel}">${escapeAttribute(copy.emailLabel)}</span><input aria-describedby="${HRANESS_MAILING_STATUS_SLOT}" autocomplete="email" autocapitalize="none" class="${footerClasses.mailingInput}" inputmode="email" name="email" placeholder="${copy.placeholder}" maxlength="254" dir="ltr" required="" spellcheck="false" type="email"${email}${pending ? ' readonly=""' : ""}></label><button class="${footerClasses.mailingSubmit}" data-foil="" data-slot="${HRANESS_MAILING_FORM_SLOT}-submit" type="submit"${pending || accepted ? ' disabled="" aria-disabled="true"' : ""}>${escapeAttribute(pending ? copy.pending : copy.submit)}</button></div><input aria-hidden="true" autocomplete="off" class="${footerClasses.honeypot}" name="${HRANESS_MAILING_HONEYPOT_FIELD}" tabindex="-1" type="text" value=""></form><p aria-atomic="true" class="${mailingStatusClassName(state.kind)}" data-slot="${HRANESS_MAILING_STATUS_SLOT}" data-state="${state.kind}" id="${HRANESS_MAILING_STATUS_SLOT}" tabindex="-1" aria-live="${state.kind === "error" ? "assertive" : "polite"}" role="${state.kind === "error" ? "alert" : "status"}">${escapeAttribute(statusCopy)}</p></dialog></details>`;
}
var HRANESS_CONSENT_TEXT_SIGNED_IN = "Cookies keep you signed in, and your browser remembers your appearance setting and this choice. None of it is used for advertising or cross-site tracking.";
var HRANESS_CONSENT_TEXT = "Your browser remembers your appearance setting and this choice. None of it is used for advertising or cross-site tracking.";
function renderConsentHtml(signIn) {
  return `<div class="${footerClasses.consent}" data-slot="${HRANESS_CONSENT_SLOT}" hidden=""><button class="${footerClasses.consentAccept}" data-slot="${HRANESS_CONSENT_ACCEPT_SLOT}" type="button">Accept cookies</button><span aria-hidden="true" class="${footerClasses.consentSeparator}">·</span><details class="${footerClasses.consentMore}"><summary class="${footerClasses.consentLearn}">Learn more</summary><span class="${footerClasses.consentPanel}">${signIn ? HRANESS_CONSENT_TEXT_SIGNED_IN : HRANESS_CONSENT_TEXT} <a class="${footerClasses.consentLink}" href="https://hraness.com/privacy">Privacy policy</a></span></details></div>`;
}
function resolveSupportLink(profile) {
  if (profile === undefined)
    return null;
  const offer = createSupportOffer(profile, "web");
  const action = offer.actions.find((candidate) => candidate.kind === "support");
  if (action === undefined)
    throw new TypeError("Support offer has no support destination.");
  return Object.freeze({
    href: action.url,
    label: `Support ${offer.product.name}: optional paid membership`,
    title: `${offer.valueProposition} Review optional paid membership.`
  });
}
function renderHranessSiteFooterInnerHtml(showBrand, mailingList, state = MAILING_IDLE_STATE, socialLinks = HRANESS_SOCIAL_LINKS, presentation = DEFAULT_FOOTER_PRESENTATION) {
  const supportLink = resolveSupportLink(presentation.support);
  const supportHtml = supportLink === null ? "" : `<a class="${footerClasses.support}" data-slot="hraness-support-link" href="${escapeAttribute(supportLink.href)}" aria-label="${escapeAttribute(supportLink.label)}" title="${escapeAttribute(supportLink.title)}" lang="en" dir="ltr">${HRANESS_SUPPORT_ICON_HTML}</a>`;
  const mailingHtml = mailingList.kind === "none" ? "" : mailingList.kind === "account" ? `<a class="${footerClasses.account}" data-slot="hraness-account-link" href="${HRANESS_ACCOUNT_URL}" lang="${escapeAttribute(presentation.locale.locale)}" dir="${presentation.locale.dir}">${escapeAttribute(presentation.locale.accountLabel)}</a>` : renderMailingList(mailingList, state.kind !== "idle" && state.audience === mailingList.audience ? state : MAILING_IDLE_STATE, presentation);
  return `<div class="${footerInnerClassName(mailingList.kind === "signup", presentation.sticky, presentation.variant.color, mailingList.kind === "account", supportLink !== null, showBrand)}">${showBrand ? HRANESS_SITE_FOOTER_BRAND_HTML : ""}${mailingHtml}${supportHtml}${renderConsentHtml(presentation.signIn === true)}${renderHranessSocialLinksHtml(socialLinks)}</div>`;
}

// src/index.ts
var HRANESS_HOME_URL = "https://hraness.com/";
var hranessSocialLinks = HRANESS_SOCIAL_LINKS;
function renderHranessSiteFooter({
  locale: localeInput,
  placement = "sticky",
  variant = DEFAULT_FOOTER_VARIANT,
  mailingList: mailingListInput,
  showBrand = true,
  signIn = false,
  social: socialInput,
  support
}) {
  const mailingList = parseHranessMailingListConfig(mailingListInput);
  variant = parseFooterVariant(variant);
  const socialLinks = resolveHranessSocialLinks(socialInput);
  return `<footer aria-label="${HRANESS_FOOTER_LABEL}" class="${footerClassName(mailingList.kind === "signup", placement === "sticky")}" data-brand="${showBrand ? "visible" : "hidden"}" data-mailing-list="${mailingList.kind}" data-slot="${HRANESS_FOOTER_SLOT}" id="${HRANESS_FOOTER_SLOT}">${renderHranessSiteFooterInnerHtml(showBrand, mailingList, undefined, socialLinks, {
    locale: resolveFooterLocale(localeInput),
    variant,
    sticky: placement === "sticky",
    signIn: signIn === true,
    ...support === undefined ? {} : {
      support
    }
  })}</footer>`;
}
export {
  resolveFooterLocale,
  renderHranessSiteFooter,
  parseFooterVariant,
  parseFooterEnrollment,
  hranessSocialLinks,
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_HOME_URL,
  HRANESS_ACCOUNT_URL
};

//# debugId=59B66800D00D846164756E2164756E21
