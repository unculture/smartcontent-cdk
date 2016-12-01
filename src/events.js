import events from 'smartcontent-cdk/lib/events';
import meta from './data/meta';
import campaign from './data/campaign';
import dataItems from './data/data';
import rulesets from './data/rulesets';

events(meta, campaign, dataItems, rulesets);