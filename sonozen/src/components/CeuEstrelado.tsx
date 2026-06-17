/* Estrelas de fundo com posições fixas para que o servidor e o navegador renderizem o mesmo céu */

const ESTRELAS = [
  // topo
  { x: 4, y: 6, tam: 3, o: 0.9, cintila: true, atraso: "0s" },
  { x: 11, y: 14, tam: 2, o: 0.55 },
  { x: 17, y: 4, tam: 2, o: 0.7 },
  { x: 24, y: 19, tam: 2, o: 0.5 },
  { x: 30, y: 9, tam: 3, o: 0.85, cintila: true, atraso: "2s" },
  { x: 37, y: 3, tam: 2, o: 0.6 },
  { x: 43, y: 16, tam: 2, o: 0.5 },
  { x: 50, y: 7, tam: 3, o: 0.8, cintila: true, atraso: "4s" },
  { x: 57, y: 2, tam: 2, o: 0.6 },
  { x: 63, y: 13, tam: 2, o: 0.55 },
  { x: 69, y: 5, tam: 3, o: 0.9, cintila: true, atraso: "1s" },
  { x: 75, y: 18, tam: 2, o: 0.5 },
  { x: 80, y: 10, tam: 2, o: 0.65 },
  { x: 87, y: 4, tam: 3, o: 0.85, cintila: true, atraso: "3s" },
  { x: 93, y: 15, tam: 2, o: 0.55 },
  { x: 97, y: 8, tam: 2, o: 0.7 },
  { x: 8, y: 24, tam: 2, o: 0.45 },
  { x: 35, y: 27, tam: 2, o: 0.4 },
  { x: 66, y: 25, tam: 2, o: 0.45 },
  { x: 91, y: 27, tam: 2, o: 0.5, cintila: true, atraso: "5s" },
  // meio
  { x: 14, y: 36, tam: 2, o: 0.45 },
  { x: 47, y: 33, tam: 2, o: 0.4, cintila: true, atraso: "2.5s" },
  { x: 72, y: 38, tam: 2, o: 0.45 },
  { x: 28, y: 44, tam: 2, o: 0.35 },
  { x: 88, y: 42, tam: 2, o: 0.4 },
  { x: 55, y: 48, tam: 2, o: 0.35 },
  { x: 6, y: 52, tam: 2, o: 0.4, cintila: true, atraso: "1.5s" },
  { x: 95, y: 55, tam: 2, o: 0.35 },
  // baixo, rareando rumo ao horizonte
  { x: 20, y: 62, tam: 2, o: 0.3 },
  { x: 62, y: 66, tam: 2, o: 0.3 },
  { x: 41, y: 72, tam: 2, o: 0.28, cintila: true, atraso: "3.5s" },
  { x: 83, y: 75, tam: 2, o: 0.25 },
  { x: 10, y: 81, tam: 2, o: 0.22 },
  { x: 70, y: 86, tam: 2, o: 0.2 },
  { x: 33, y: 90, tam: 2, o: 0.18 },
];

export default function CeuEstrelado() {
  return (
    <>
      {/* Estrelas */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        {ESTRELAS.map((e, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-blue-100 ${e.cintila ? "animate-cintilar" : ""}`}
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: e.tam,
              height: e.tam,
              opacity: e.o,
              animationDelay: e.atraso,
            }}
          />
        ))}
      </div>

      {/* Horizonte: clarão azul sutil na base */}
      <div className="absolute bottom-0 left-0 right-0 h-64 -z-10 bg-[radial-gradient(ellipse_80%_100%_at_50%_100%,rgba(37,99,235,0.14),transparent)] pointer-events-none"></div>
    </>
  );
}