// este codigo ejecuta el proceso final del pedido

class CheckoutView {
    static inyectarModal() {
        if (document.getElementById('vita-modal-checkout')) return;

        const modalHTML = `
            <div id="vita-modal-checkout" class="vita-modal-overlay">
                <div class="vita-modal-content">
                    <div class="vita-modal-header">
                        <div class="vita-modal-logo"><i class="fa-solid fa-leaf"></i> VITA-SUPPS</div>
                        <h2>Finalizar Compra</h2>
                        <p>Por favor, ingresa los datos de entrega de tu pedido.</p>
                    </div>
                    <form id="vita-form-checkout">
                        <div class="vita-input-group">
                            <label for="vita-input-direccion"><i class="fa-solid fa-map-location-dot"></i> Dirección de Envío</label>
                            <input type="text" id="vita-input-direccion" placeholder="Ej. Av. Las Palmas 456, Caracas" required autocomplete="off">
                        </div>
                        <div class="vita-input-group">
                            <label for="vita-input-telefono"><i class="fa-solid fa-phone"></i> Teléfono de Contacto</label>
                            <input type="text" id="vita-input-telefono" placeholder="Ej. 0412-0000000" required autocomplete="off">
                        </div>
                        <div class="vita-modal-actions">
                            <button type="button" id="vita-btn-cancelar" class="vita-btn-secondary">Cancelar</button>
                            <button type="submit" class="vita-btn-pagar">
                                <i class="fa-solid fa-lock"></i> Confirmar Procesamiento de Pedido
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>
                .vita-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 99999; opacity: 0; transition: opacity 0.3s ease;
                }
                .vita-modal-overlay.active { opacity: 1; }
                .vita-modal-content {
                    background: #ffffff; padding: 35px 30px; border-radius: 16px;
                    width: 90%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    font-family: 'Roboto', sans-serif; transform: scale(0.92); transition: transform 0.3s ease;
                }
                .vita-modal-overlay.active .vita-modal-content { transform: scale(1); }
                .vita-modal-header { text-align: center; margin-bottom: 25px; }
                .vita-modal-logo {
                    color: #2e7d32; font-weight: 700; font-size: 1.3rem;
                    display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;
                }
                .vita-modal-header h2 { font-size: 1.5rem; color: #1f2937; margin-bottom: 6px; font-weight: 700; }
                .vita-modal-header p { font-size: 0.9rem; color: #6b7280; }
                .vita-input-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
                .vita-input-group label { font-size: 0.85rem; font-weight: 700; color: #4b5563; text-align: left; }
                .vita-input-group label i { color: #2e7d32; margin-right: 4px; }
                .vita-input-group input {
                    padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 0.95rem; color: #1f2937; transition: all 0.2s;
                }
                .vita-input-group input:focus { outline: none; border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15); }
                .vita-modal-actions { display: flex; gap: 12px; margin-top: 25px; }
                .vita-btn-secondary, .vita-btn-pagar, .vita-btn-exito {
                    flex: 1; padding: 13px; font-size: 0.95rem; font-weight: 700;
                    border-radius: 8px; cursor: pointer; border: none; transition: all 0.2s;
                }
                .vita-btn-secondary { background: #f3f4f6; color: #4b5563; }
                .vita-btn-secondary:hover { background: #e5e7eb; }
                .vita-btn-pagar { background: #2e7d32; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .vita-btn-pagar:hover { background: #1b5e20; }
                .vita-btn-pagar:disabled { background: #9ca3af; cursor: not-allowed; }
                .vita-btn-exito { background: #2e7d32; color: #ffffff; width: 100%; margin-top: 20px; }
                .vita-btn-exito:hover { background: #1b5e20; }
            </style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    static mostrarExito(modal, mensaje, callbackAlCerrar) {
        const modalContenido = modal.querySelector('.vita-modal-content');
        modalContenido.innerHTML = `
            <div style="text-align: center; padding: 15px 10px 5px 10px;">
                <i class="fa-solid fa-circle-check" style="color: #2e7d32; font-size: 4rem; margin-bottom: 15px;"></i>
                <h3 style="font-size: 1.6rem; margin-bottom: 10px; color: #1f2937; font-weight:700;">¡Compra Realizada!</h3>
                <p style="color: #4b5563; font-size: 1rem; margin-bottom: 5px;">${mensaje}</p>
                <p style="color: #9ca3af; font-size: 0.85rem; margin-bottom: 15px;">Gracias por confiar en VITA-SUPPS</p>
                <button type="button" id="vita-btn-exito-ok" class="vita-btn-exito">Aceptar</button>
            </div>
        `;

        document.getElementById('vita-btn-exito-ok').addEventListener('click', callbackAlCerrar);
    }
}