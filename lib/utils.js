import moment from 'moment';
import kleur from 'kleur';

export function mLog(str, c = 'magenta', withNewLine = true){
  let display = kleur[c](`${moment().format()} - ${str}`);
  if (withNewLine) {
    console.log(display);
  }
  else {
    process.stdout.write(display);
  }
}
