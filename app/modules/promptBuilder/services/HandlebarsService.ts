import Handlebars from "handlebars";

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  // @ts-ignore
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

// @ts-ignore
Handlebars.__switch_stack__ = [];

Handlebars.registerHelper("switch", function (value, options) {
  // @ts-ignore
  Handlebars.__switch_stack__.push({
    switch_match: false,
    switch_value: value,
  });
  // @ts-ignore
  var html = options.fn(this);
  // @ts-ignore
  Handlebars.__switch_stack__.pop();
  return html;
});

Handlebars.registerHelper("case", function (value, options) {
  var args = Array.from(arguments);
  var options = args.pop();
  var caseValues = args;
  // @ts-ignore
  var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];

  if (stack.switch_match || caseValues.indexOf(stack.switch_value) === -1) {
    return "";
  } else {
    stack.switch_match = true;
    // @ts-ignore
    return options.fn(this);
  }
});

Handlebars.registerHelper("default", function (options) {
  // @ts-ignore
  var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];
  if (!stack.switch_match) {
    // @ts-ignore
    return options.fn(this);
  }
});

Handlebars.registerHelper("text", function (value, options) {
  return value;
});

// block directive just for sectioning with optional title
// Handlebars.registerHelper("block", function (title, options) {
//   var args = Array.from(arguments);
//   var options = args.pop();
//   var title = args.length ? args.shift() : null;
//   // @ts-ignore
//   var content = options.fn(this);
//   var result = "";
//   if (title) {
//     result += `${title}\n`;
//   }
//   result += content;
//   return result;
// });
// blockTwo with optional preTitle and postTitle and optional content
Handlebars.registerHelper("block", function (preTitle, postTitle, options) {
  var args = Array.from(arguments);
  var options = args.pop();
  var preTitle = args.length ? args.shift() : null;
  var postTitle = args.length ? args.shift() : null;
  // @ts-ignore
  var content = options.fn(this);
  var result = "";
  if (preTitle) {
    result += `${preTitle}\n`;
  }
  result += content;
  if (postTitle) {
    result += `${postTitle}\n`;
  }
  return result;
});

export function compile(template: string, data: any) {
  const compiled = Handlebars.compile(template);
  let result = compiled(data);
  // replace more three or more newlines with two newlines
  var times = 0;
  do {
    result = result.replace(/\n{3,}/gm, "\n\n");
    times++;
    if (times > 100) {
      break;
    }
  } while (result.match(/\n{3,}/gm));
  // replace tabs with empty string
  result = result.replace(/\t/gm, "");
  // replace four spaces with empty string
  result = result.replace(/ {4}/gm, "");

  // remove comments within <!-- --> and also the <!-- --> themselves and also the linebreaks they are on
  result = result.replace(/<!--[\s\S]*?-->\n?/gm, "");
  result = result
    .replace(/\n{3,}/gm, "\n\n")
    .replace(/\t/gm, "")
    .replace(/ {4}/gm, "");
  return result;
}

export default {
  compile,
};
