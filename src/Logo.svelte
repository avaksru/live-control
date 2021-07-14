
<div  class="rotate-shadows"></div>

<style>
.rotate-shadows {
  width: 220px;
  height: 220px;
  position: relative;
 }
.rotate-shadows:after,
.rotate-shadows:before {
  content: "";
  border-radius: 150%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
}
.rotate-shadows:before {
  box-shadow: inset 0 20px 0 rgba(0, 250, 250, 0.2), inset 20px 0 0 rgba(0, 200, 200, 0.2), inset 0 -20px 0 rgba(0, 150, 200, 0.2), inset -20px 0 0 rgba(0, 200, 250, 0.2);
  animation: rotate-before 9s -0.5s linear infinite;
}
.rotate-shadows:after {
  box-shadow: inset 0 20px 0 rgba(250, 250, 0, 0.2), inset 20px 0 0 rgba(250, 200, 0, 0.2), inset 0 -20px 0 rgba(250, 150, 0, 0.2), inset -20px 0 0 rgba(250, 100, 0, 0.2);
  animation: rotate-after 9s -0.5s linear infinite;
}
@keyframes rotate-after {
  0% {transform: rotateZ(0deg) scaleX(1) scaleY(1);}
  50% {transform: rotateZ(180deg) scaleX(0.82) scaleY(0.95);}
  100% {transform: rotateZ(360deg) scaleX(1) scaleY(1);}
}
@keyframes rotate-before {
  0% {transform: rotateZ(0deg) scaleX(1) scaleY(1);}
  50% {transform: rotateZ(-180deg) scaleX(0.95) scaleY(0.85);}
  100% {transform: rotateZ(-360deg) scaleX(1) scaleY(1);}
}
</style>