import { v4 } from 'uuid';

/**
 * @param {Object} box - the application sandbox
 */
export default function(box) {
  const events = box.get('events');
  const outbox = [];
  let jainkyModuleDown = false;

  box.put('slideshow', { create });

  events.on('slideshow.downloaded', onSlideshowDownloaded);
  events.on('application.info.moduleStopped', onModuleStopped);
  events.on('application.info.moduleRestarted', onModuleRestarted);

  
  function create() {
    const uuid = v4();

    if (jainkyModuleDown) {
      outbox.push(uuid);
      console.log(outbox);
      return {
        url: null,
        status: 'pending'
      }
    }

    return {
      url: `/slideshows/${uuid}`,
      status: 'complete'
    }
  }

   /**
   * 
   */
  function onModuleRestarted({moduleName}) {  
    if (moduleName === '/lib/jainky-module') {
      jainkyModuleDown = false;
      
      for (let item of outbox) {
        console.log(item);
      }
    }
  }

  /**
   * 
   */
  function onModuleStopped({moduleName}) {  
    if (moduleName === '/lib/jainky-module') {
      jainkyModuleDown = true;
    }
  }

  /**
   * @param {Object} data
   */
  function onSlideshowDownloaded(data) {
    console.log(data);
  }
}