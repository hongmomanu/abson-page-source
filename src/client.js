import * as sapper from '@sapper/app';
import { init as initmenu} from './menu';

sapper.start({
	target: document.querySelector('#sapper')
});
initmenu();

