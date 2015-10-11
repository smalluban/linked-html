import Engine from '../../src/Engine';
import EventListener from '../../src/Markers/EventListener';

describe('EventListener', ()=> {
  let engine, node, spy;

  beforeEach(()=> {
    spy = jasmine.createSpy('callback');
    node = document.createElement('ul');
    engine = new Engine(document.createElement('div'));
    engine.test = spy;
  });

  it('call function on proper event', ()=> {
    new EventListener(engine, node, 'click: @test');
    node.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.mostRecent().object).toEqual(engine);
  });
});
