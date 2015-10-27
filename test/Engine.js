import Engine from '../src/Engine';

describe('Engine instance', ()=> {

  let el, marker;

  beforeEach(()=> {
    marker = jasmine.createSpy('marker');
    el = document.createElement('div');
    el.innerHTML = `
      <div --marker="test1">
        To jest text
        <span --marker="test2"></span>
      </div>
    `;
  });

  it('call markers', ()=> {
    new Engine(el, { markers: { marker } });
    expect(marker.calls.count()).toEqual(2);
  });

  it('call marker with proper arguments', ()=> {
    const engine = new Engine(el, { markers: { marker } });

    expect(marker.calls.argsFor(0))
      .toEqual([engine, el.children[0], "test1"]);
  });

  it('use custom prefix', ()=> {
    el.innerHTML = `<div data-custom-marker="myMarker"></div>`;
    const markers = { marker: ()=> {} };
    const spy = spyOn(markers, 'marker');

    new Engine(el, {
      prefix: 'data-custom',
      markers
    });

    expect(spy).toHaveBeenCalled();
  });

  it('translate marker id from dash to camelCase', ()=> {
    el.innerHTML = `<div --my-marker="myMarker"></div>`;
    const myMarker = jasmine.createSpy('myMarker');
    new Engine(el, { markers: { myMarker }});

    expect(myMarker).toHaveBeenCalled();
  });

  it('stop compiling childs when marker has breakCompile option', ()=> {
    const Marker = function () {};
    Marker._options = { breakCompile: true };
    const markers = {
      marker: Marker
    };

    const spy = spyOn(markers, 'marker').and.callThrough();

    new Engine(el, { markers });
    expect(spy.calls.count()).toEqual(1);
  });
});
