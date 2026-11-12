const scripts: Record<string, boolean> = {
  "Head": false,
  "Login": false,
  "TourTabs": false,
  "TourLogin": false,
  "ContestAccepting": true,
  "ContestVoting": true
};

export function PageScripts(markup: string) {
  return markup.replaceAll(/__SCRIPT_([A-Za-z]+)(?::(\d+))?__/g, (token, name, time) => {
    if (!Object.hasOwn(scripts, name) || (scripts[name] && !time)) return token;
    const data = scripts[name] ? ' data-contest-time="' + time + '"' : '';
    return '<script src="/frontend-scripts/' + name + '.js"' + data + '></script>';
  });
}
